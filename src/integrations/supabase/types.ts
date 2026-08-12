export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      order_items: {
        Row: {
          id: string
          image_key: string
          name: string
          order_id: string
          product_id: string | null
          quantity: number
          unit_price: number
          variant_id: string | null
          variant_label: string
        }
        Insert: {
          id?: string
          image_key: string
          name: string
          order_id: string
          product_id?: string | null
          quantity: number
          unit_price: number
          variant_id?: string | null
          variant_label: string
        }
        Update: {
          id?: string
          image_key?: string
          name?: string
          order_id?: string
          product_id?: string | null
          quantity?: number
          unit_price?: number
          variant_id?: string | null
          variant_label?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address_line1: string
          address_line2: string | null
          city: string
          courier: string | null
          created_at: string
          email: string
          eta: string | null
          full_name: string
          id: string
          latitude: number | null
          longitude: number | null
          order_code: string
          payment_method: string
          phone: string
          pincode: string
          shipping: number
          state: string
          status: string
          subtotal: number
          total: number
          tracking_number: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          city: string
          courier?: string | null
          created_at?: string
          email: string
          eta?: string | null
          full_name: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          order_code: string
          payment_method: string
          phone: string
          pincode: string
          shipping: number
          state: string
          status?: string
          subtotal: number
          total: number
          tracking_number?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          city?: string
          courier?: string | null
          created_at?: string
          email?: string
          eta?: string | null
          full_name?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          order_code?: string
          payment_method?: string
          phone?: string
          pincode?: string
          shipping?: number
          state?: string
          status?: string
          subtotal?: number
          total?: number
          tracking_number?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      product_variants: {
        Row: {
          color_hex: string
          color_name: string
          id: string
          price_delta: number
          product_id: string
          size: string
          sku: string
          sort_order: number
          stock: number
        }
        Insert: {
          color_hex: string
          color_name: string
          id?: string
          price_delta?: number
          product_id: string
          size: string
          sku: string
          sort_order?: number
          stock?: number
        }
        Update: {
          color_hex?: string
          color_name?: string
          id?: string
          price_delta?: number
          product_id?: string
          size?: string
          sku?: string
          sort_order?: number
          stock?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          badge: string | null
          care: string | null
          category: string
          compare_at_inr: number | null
          created_at: string
          description: string
          fabric: string | null
          fit: string | null
          id: string
          image_key: string
          is_featured: boolean
          name: string
          price_inr: number
          rating: number
          review_count: number
          slug: string
          sort_order: number
          story: string | null
          tagline: string
        }
        Insert: {
          badge?: string | null
          care?: string | null
          category: string
          compare_at_inr?: number | null
          created_at?: string
          description: string
          fabric?: string | null
          fit?: string | null
          id?: string
          image_key: string
          is_featured?: boolean
          name: string
          price_inr: number
          rating?: number
          review_count?: number
          slug: string
          sort_order?: number
          story?: string | null
          tagline: string
        }
        Update: {
          badge?: string | null
          care?: string | null
          category?: string
          compare_at_inr?: number | null
          created_at?: string
          description?: string
          fabric?: string | null
          fit?: string | null
          id?: string
          image_key?: string
          is_featured?: boolean
          name?: string
          price_inr?: number
          rating?: number
          review_count?: number
          slug?: string
          sort_order?: number
          story?: string | null
          tagline?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          author: string
          body: string
          city: string | null
          created_at: string
          id: string
          is_verified: boolean
          product_id: string | null
          rating: number
          title: string
        }
        Insert: {
          author: string
          body: string
          city?: string | null
          created_at?: string
          id?: string
          is_verified?: boolean
          product_id?: string | null
          rating: number
          title: string
        }
        Update: {
          author?: string
          body?: string
          city?: string | null
          created_at?: string
          id?: string
          is_verified?: boolean
          product_id?: string | null
          rating?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          cod_enabled: boolean
          free_delivery_threshold: number
          id: number
          return_window_days: number
          shipping_fee: number
          support_email: string
          support_phone: string
        }
        Insert: {
          cod_enabled?: boolean
          free_delivery_threshold?: number
          id?: number
          return_window_days?: number
          shipping_fee?: number
          support_email?: string
          support_phone?: string
        }
        Update: {
          cod_enabled?: boolean
          free_delivery_threshold?: number
          id?: number
          return_window_days?: number
          shipping_fee?: number
          support_email?: string
          support_phone?: string
        }
        Relationships: []
      }
      tracking_events: {
        Row: {
          happened_at: string
          id: string
          note: string | null
          order_id: string
          status: string
          title: string
        }
        Insert: {
          happened_at?: string
          id?: string
          note?: string | null
          order_id: string
          status: string
          title: string
        }
        Update: {
          happened_at?: string
          id?: string
          note?: string | null
          order_id?: string
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "tracking_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
