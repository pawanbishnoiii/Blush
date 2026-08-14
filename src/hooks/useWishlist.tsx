import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { wishlistQuery } from "@/lib/queries";
import { useAuth } from "@/hooks/useAuth";

const GUEST_KEY = "blush:wishlist";

function readGuest(): string[] {
  try {
    const raw = window.localStorage.getItem(GUEST_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeGuest(ids: string[]) {
  try {
    window.localStorage.setItem(GUEST_KEY, JSON.stringify(ids));
  } catch {
    // ignore quota / privacy errors
  }
}

/**
 * Wishlist that works signed out (localStorage) and signed in (synced to the
 * account). Guest saves merge into the account on the first signed-in read.
 */
export function useWishlist() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const list = useQuery({ ...wishlistQuery, enabled: Boolean(user) });
  const [guestIds, setGuestIds] = useState<string[]>([]);
  const merged = useRef(false);

  useEffect(() => {
    setGuestIds(readGuest());
  }, []);

  // Merge guest saves into the account once, right after sign-in.
  useEffect(() => {
    if (!user || merged.current) return;
    const pending = readGuest();
    if (pending.length === 0) {
      merged.current = true;
      return;
    }
    merged.current = true;
    void (async () => {
      const { data: existing } = await supabase
        .from("wishlist")
        .select("product_id")
        .eq("user_id", user.id);
      const have = new Set((existing ?? []).map((r) => r.product_id));
      const rows = pending
        .filter((id) => !have.has(id))
        .map((product_id) => ({ product_id, user_id: user.id }));
      if (rows.length) await supabase.from("wishlist").insert(rows);
      writeGuest([]);
      setGuestIds([]);
      await qc.invalidateQueries({ queryKey: ["wishlist"] });
    })();
  }, [user, qc]);

  const ids = new Set(user ? (list.data ?? []) : guestIds);

  const toggle = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) {
        const next = ids.has(productId)
          ? guestIds.filter((id) => id !== productId)
          : [...guestIds, productId];
        writeGuest(next);
        setGuestIds(next);
        return next.includes(productId);
      }
      if (ids.has(productId)) {
        const { error } = await supabase
          .from("wishlist")
          .delete()
          .eq("product_id", productId)
          .eq("user_id", user.id);
        if (error) throw error;
        return false;
      }
      const { error } = await supabase
        .from("wishlist")
        .insert({ product_id: productId, user_id: user.id });
      if (error) throw error;
      return true;
    },
    onSuccess: (added) => {
      qc.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success(added ? "Saved to wishlist" : "Removed from wishlist", {
        description: user ? undefined : "Sign in to sync it across devices.",
      });
    },
    onError: (e: Error) => {
      toast.error(e.message);
    },
  });

  return {
    ids,
    isSaved: (id: string) => ids.has(id),
    toggle: (id: string) => toggle.mutate(id),
    pending: toggle.isPending,
    signedIn: Boolean(user),
  };
}
