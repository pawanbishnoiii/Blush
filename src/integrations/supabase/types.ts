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
      addresses: {
        Row: {
          address_line1: string
          address_line2: string | null
          city: string
          created_at: string
          full_name: string
          id: string
          is_default: boolean
          label: string
          latitude: number | null
          longitude: number | null
          phone: string
          pincode: string
          state: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          city: string
          created_at?: string
          full_name: string
          id?: string
          is_default?: boolean
          label?: string
          latitude?: number | null
          longitude?: number | null
          phone: string
          pincode: string
          state: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          city?: string
          created_at?: string
          full_name?: string
          id?: string
          is_default?: boolean
          label?: string
          latitude?: number | null
          longitude?: number | null
          phone?: string
          pincode?: string
          state?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      automation_logs: {
        Row: {
          created_at: string
          error: string | null
          id: string
          payload: Json
          rule_id: string | null
          rule_name: string
          status: string
          trigger_event: string
        }
        Insert: {
          created_at?: string
          error?: string | null
          id?: string
          payload?: Json
          rule_id?: string | null
          rule_name: string
          status?: string
          trigger_event: string
        }
        Update: {
          created_at?: string
          error?: string | null
          id?: string
          payload?: Json
          rule_id?: string | null
          rule_name?: string
          status?: string
          trigger_event?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_logs_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "automation_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_rules: {
        Row: {
          action_config: Json
          action_kind: string
          created_at: string
          description: string | null
          id: string
          is_enabled: boolean
          last_run_at: string | null
          name: string
          run_count: number
          trigger_event: string
          updated_at: string
        }
        Insert: {
          action_config?: Json
          action_kind: string
          created_at?: string
          description?: string | null
          id?: string
          is_enabled?: boolean
          last_run_at?: string | null
          name: string
          run_count?: number
          trigger_event: string
          updated_at?: string
        }
        Update: {
          action_config?: Json
          action_kind?: string
          created_at?: string
          description?: string | null
          id?: string
          is_enabled?: boolean
          last_run_at?: string | null
          name?: string
          run_count?: number
          trigger_event?: string
          updated_at?: string
        }
        Relationships: []
      }
      banners: {
        Row: {
          created_at: string
          cta_label: string | null
          ends_at: string | null
          id: string
          image_url: string
          is_active: boolean
          link_url: string | null
          mobile_image_url: string | null
          mood_key: string | null
          placement: string
          sort_order: number
          starts_at: string
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          cta_label?: string | null
          ends_at?: string | null
          id?: string
          image_url: string
          is_active?: boolean
          link_url?: string | null
          mobile_image_url?: string | null
          mood_key?: string | null
          placement?: string
          sort_order?: number
          starts_at?: string
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          cta_label?: string | null
          ends_at?: string | null
          id?: string
          image_url?: string
          is_active?: boolean
          link_url?: string | null
          mobile_image_url?: string | null
          mood_key?: string | null
          placement?: string
          sort_order?: number
          starts_at?: string
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      collection_products: {
        Row: {
          collection_id: string
          product_id: string
          sort_order: number
        }
        Insert: {
          collection_id: string
          product_id: string
          sort_order?: number
        }
        Update: {
          collection_id?: string
          product_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "collection_products_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          created_at: string
          hero_gradient: string | null
          icon: string | null
          id: string
          is_published: boolean
          mood_key: string | null
          slug: string
          sort_order: number
          subtitle: string | null
          title: string
        }
        Insert: {
          created_at?: string
          hero_gradient?: string | null
          icon?: string | null
          id?: string
          is_published?: boolean
          mood_key?: string | null
          slug: string
          sort_order?: number
          subtitle?: string | null
          title: string
        }
        Update: {
          created_at?: string
          hero_gradient?: string | null
          icon?: string | null
          id?: string
          is_published?: boolean
          mood_key?: string | null
          slug?: string
          sort_order?: number
          subtitle?: string | null
          title?: string
        }
        Relationships: []
      }
      coupon_redemptions: {
        Row: {
          amount: number
          coupon_id: string
          created_at: string
          id: string
          order_id: string | null
          user_id: string | null
        }
        Insert: {
          amount?: number
          coupon_id: string
          created_at?: string
          id?: string
          order_id?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          coupon_id?: string
          created_at?: string
          id?: string
          order_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coupon_redemptions_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_redemptions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          description: string | null
          expires_at: string | null
          id: string
          is_active: boolean
          kind: string
          max_discount: number | null
          min_cart: number
          per_user_limit: number
          starts_at: string
          title: string
          usage_limit: number | null
          used_count: number
          value: number
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          kind?: string
          max_discount?: number | null
          min_cart?: number
          per_user_limit?: number
          starts_at?: string
          title: string
          usage_limit?: number | null
          used_count?: number
          value: number
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          kind?: string
          max_discount?: number | null
          min_cart?: number
          per_user_limit?: number
          starts_at?: string
          title?: string
          usage_limit?: number | null
          used_count?: number
          value?: number
        }
        Relationships: []
      }
      delivery_providers: {
        Row: {
          api_base_url: string | null
          api_key_secret_name: string | null
          code: string
          created_at: string
          id: string
          is_enabled: boolean
          logo_url: string | null
          max_days: number
          min_days: number
          name: string
          priority: number
          serviceable_pincode_prefixes: string[]
          supports_cod: boolean
          supports_reverse_pickup: boolean
          tracking_url_pattern: string | null
          updated_at: string
        }
        Insert: {
          api_base_url?: string | null
          api_key_secret_name?: string | null
          code: string
          created_at?: string
          id?: string
          is_enabled?: boolean
          logo_url?: string | null
          max_days?: number
          min_days?: number
          name: string
          priority?: number
          serviceable_pincode_prefixes?: string[]
          supports_cod?: boolean
          supports_reverse_pickup?: boolean
          tracking_url_pattern?: string | null
          updated_at?: string
        }
        Update: {
          api_base_url?: string | null
          api_key_secret_name?: string | null
          code?: string
          created_at?: string
          id?: string
          is_enabled?: boolean
          logo_url?: string | null
          max_days?: number
          min_days?: number
          name?: string
          priority?: number
          serviceable_pincode_prefixes?: string[]
          supports_cod?: boolean
          supports_reverse_pickup?: boolean
          tracking_url_pattern?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string
          answer_hi: string | null
          created_at: string
          group_name: string
          icon: string | null
          id: string
          is_published: boolean
          question: string
          question_hi: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          answer: string
          answer_hi?: string | null
          created_at?: string
          group_name?: string
          icon?: string | null
          id?: string
          is_published?: boolean
          question: string
          question_hi?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          answer?: string
          answer_hi?: string | null
          created_at?: string
          group_name?: string
          icon?: string | null
          id?: string
          is_published?: boolean
          question?: string
          question_hi?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          icon: string | null
          id: string
          is_read: boolean
          kind: string
          link: string | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          is_read?: boolean
          kind?: string
          link?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          is_read?: boolean
          kind?: string
          link?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
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
      product_images: {
        Row: {
          alt: string | null
          color_name: string | null
          created_at: string
          id: string
          product_id: string
          sort_order: number
          url: string
          variant_id: string | null
        }
        Insert: {
          alt?: string | null
          color_name?: string | null
          created_at?: string
          id?: string
          product_id: string
          sort_order?: number
          url: string
          variant_id?: string | null
        }
        Update: {
          alt?: string | null
          color_name?: string | null
          created_at?: string
          id?: string
          product_id?: string
          sort_order?: number
          url?: string
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_images_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          color_hex: string
          color_name: string
          id: string
          image_key: string | null
          price_delta: number
          product_id: string
          size: string
          sku: string
          sort_order: number
          stock: number
          swatch_url: string | null
        }
        Insert: {
          color_hex: string
          color_name: string
          id?: string
          image_key?: string | null
          price_delta?: number
          product_id: string
          size: string
          sku: string
          sort_order?: number
          stock?: number
          swatch_url?: string | null
        }
        Update: {
          color_hex?: string
          color_name?: string
          id?: string
          image_key?: string | null
          price_delta?: number
          product_id?: string
          size?: string
          sku?: string
          sort_order?: number
          stock?: number
          swatch_url?: string | null
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
          gender: string
          id: string
          image_key: string
          is_featured: boolean
          is_published: boolean
          mood_tags: string[]
          name: string
          occasion_tags: string[]
          price_inr: number
          rating: number
          review_count: number
          seo_description: string | null
          seo_title: string | null
          size_chart: Json | null
          slug: string
          sort_order: number
          story: string | null
          subcategory: string | null
          tagline: string
          vibe_tags: string[]
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
          gender?: string
          id?: string
          image_key: string
          is_featured?: boolean
          is_published?: boolean
          mood_tags?: string[]
          name: string
          occasion_tags?: string[]
          price_inr: number
          rating?: number
          review_count?: number
          seo_description?: string | null
          seo_title?: string | null
          size_chart?: Json | null
          slug: string
          sort_order?: number
          story?: string | null
          subcategory?: string | null
          tagline: string
          vibe_tags?: string[]
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
          gender?: string
          id?: string
          image_key?: string
          is_featured?: boolean
          is_published?: boolean
          mood_tags?: string[]
          name?: string
          occasion_tags?: string[]
          price_inr?: number
          rating?: number
          review_count?: number
          seo_description?: string | null
          seo_title?: string | null
          size_chart?: Json | null
          slug?: string
          sort_order?: number
          story?: string | null
          subcategory?: string | null
          tagline?: string
          vibe_tags?: string[]
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          avatar_url: string | null
          birthday: string | null
          created_at: string
          display_name: string | null
          favourite_colours: string[]
          gender: string | null
          id: string
          language: string
          onboarded: boolean
          phone: string | null
          preferred_moods: string[]
          preferred_sizes: Json
          preferred_vibes: string[]
          reward_points: number
          skin_tone: string | null
          tier: string
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          birthday?: string | null
          created_at?: string
          display_name?: string | null
          favourite_colours?: string[]
          gender?: string | null
          id: string
          language?: string
          onboarded?: boolean
          phone?: string | null
          preferred_moods?: string[]
          preferred_sizes?: Json
          preferred_vibes?: string[]
          reward_points?: number
          skin_tone?: string | null
          tier?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          birthday?: string | null
          created_at?: string
          display_name?: string | null
          favourite_colours?: string[]
          gender?: string | null
          id?: string
          language?: string
          onboarded?: boolean
          phone?: string | null
          preferred_moods?: string[]
          preferred_sizes?: Json
          preferred_vibes?: string[]
          reward_points?: number
          skin_tone?: string | null
          tier?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      review_votes: {
        Row: {
          created_at: string
          id: string
          review_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          review_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          review_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_votes_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          author: string
          body: string
          city: string | null
          created_at: string
          helpful_count: number
          id: string
          is_verified: boolean
          order_id: string | null
          photos: string[]
          product_id: string | null
          rating: number
          status: string
          title: string
          updated_at: string
          user_id: string | null
          variant_label: string | null
        }
        Insert: {
          author: string
          body: string
          city?: string | null
          created_at?: string
          helpful_count?: number
          id?: string
          is_verified?: boolean
          order_id?: string | null
          photos?: string[]
          product_id?: string | null
          rating: number
          status?: string
          title: string
          updated_at?: string
          user_id?: string | null
          variant_label?: string | null
        }
        Update: {
          author?: string
          body?: string
          city?: string | null
          created_at?: string
          helpful_count?: number
          id?: string
          is_verified?: boolean
          order_id?: string | null
          photos?: string[]
          product_id?: string | null
          rating?: number
          status?: string
          title?: string
          updated_at?: string
          user_id?: string | null
          variant_label?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_settings: {
        Row: {
          description: string
          id: string
          keywords: string[]
          noindex: boolean
          og_image_url: string | null
          path: string
          title: string
          updated_at: string
        }
        Insert: {
          description: string
          id?: string
          keywords?: string[]
          noindex?: boolean
          og_image_url?: string | null
          path: string
          title: string
          updated_at?: string
        }
        Update: {
          description?: string
          id?: string
          keywords?: string[]
          noindex?: boolean
          og_image_url?: string | null
          path?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
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
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wishlist: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
          variant_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
          variant_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_purchased: {
        Args: { _product_id: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "customer"
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
    Enums: {
      app_role: ["admin", "moderator", "customer"],
    },
  },
} as const
