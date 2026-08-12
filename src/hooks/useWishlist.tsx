import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { wishlistQuery } from "@/lib/queries";
import { useAuth } from "@/hooks/useAuth";

export function useWishlist() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const list = useQuery({ ...wishlistQuery, enabled: Boolean(user) });
  const ids = new Set(list.data ?? []);

  const toggle = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error("SIGN_IN");
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
      toast.success(added ? "Saved to wishlist" : "Removed from wishlist");
    },
    onError: (e: Error) => {
      toast.error(e.message === "SIGN_IN" ? "Sign in to save favourites" : e.message);
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
