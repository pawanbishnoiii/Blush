import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Icon3D } from "@/components/site/Icon3D";
import { adminVariantsQuery, allProductsQuery, productImagesQuery } from "@/lib/queries";
import { imageFor, inr, type Product } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/products")({
  component: AdminProducts;
});

function AdminProducts() {
  return null;
}
