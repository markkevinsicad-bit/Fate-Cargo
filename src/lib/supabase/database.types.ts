// Hand-authored to match supabase/migrations/*.sql.
// Once the project is linked, regenerate with:
//   supabase gen types typescript --linked > src/lib/supabase/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  __InternalSupabase: {
    PostgrestVersion: "13";
  };
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          email: string | null;
          phone: string | null;
          role: "customer" | "staff" | "warehouse" | "driver" | "admin";
          business_name: string | null;
          is_business: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          role?: "customer" | "staff" | "warehouse" | "driver" | "admin";
          business_name?: string | null;
          is_business?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      destinations: {
        Row: {
          id: string;
          name: string;
          region: "visayas" | "mindanao";
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          region: "visayas" | "mindanao";
          active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["destinations"]["Insert"]>;
        Relationships: [];
      };
      services: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          icon: string | null;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          icon?: string | null;
          active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["services"]["Insert"]>;
        Relationships: [];
      };
      cargo_categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["cargo_categories"]["Insert"]>;
        Relationships: [];
      };
      loading_schedules: {
        Row: {
          id: string;
          region: "visayas" | "mindanao";
          loading_date: string;
          booking_cutoff: string | null;
          status: "scheduled" | "closed" | "completed" | "cancelled";
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          region: "visayas" | "mindanao";
          loading_date: string;
          booking_cutoff?: string | null;
          status?: "scheduled" | "closed" | "completed" | "cancelled";
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["loading_schedules"]["Insert"]>;
        Relationships: [];
      };
      quote_requests: {
        Row: {
          id: string;
          customer_id: string | null;
          full_name: string;
          phone: string;
          email: string | null;
          origin: string;
          destination_id: string | null;
          destination_text: string | null;
          cargo_category_id: string | null;
          cargo_description: string | null;
          number_of_packages: number | null;
          weight_kg: number | null;
          length_cm: number | null;
          width_cm: number | null;
          height_cm: number | null;
          volume_cbm: number | null;
          special_handling: string[];
          pickup_required: boolean;
          additional_notes: string | null;
          status: "requested" | "reviewed" | "quote_provided" | "declined" | "cancelled";
          admin_notes: string | null;
          quoted_amount: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id?: string | null;
          full_name: string;
          phone: string;
          email?: string | null;
          origin: string;
          destination_id?: string | null;
          destination_text?: string | null;
          cargo_category_id?: string | null;
          cargo_description?: string | null;
          number_of_packages?: number | null;
          weight_kg?: number | null;
          length_cm?: number | null;
          width_cm?: number | null;
          height_cm?: number | null;
          volume_cbm?: number | null;
          special_handling?: string[];
          pickup_required?: boolean;
          additional_notes?: string | null;
          status?: "requested" | "reviewed" | "quote_provided" | "declined" | "cancelled";
          admin_notes?: string | null;
          quoted_amount?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["quote_requests"]["Insert"]>;
        Relationships: [];
      };
      moving_requests: {
        Row: {
          id: string;
          customer_id: string | null;
          full_name: string;
          phone: string;
          email: string | null;
          moving_type: "house" | "office" | "condo";
          pickup_location: string;
          destination_location: string;
          preferred_date: string | null;
          rooms_estimate: string | null;
          major_items: string | null;
          elevator_available: boolean | null;
          stairs: boolean | null;
          special_items: string | null;
          notes: string | null;
          status: "requested" | "reviewed" | "quote_provided" | "declined" | "cancelled";
          admin_notes: string | null;
          quoted_amount: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id?: string | null;
          full_name: string;
          phone: string;
          email?: string | null;
          moving_type: "house" | "office" | "condo";
          pickup_location: string;
          destination_location: string;
          preferred_date?: string | null;
          rooms_estimate?: string | null;
          major_items?: string | null;
          elevator_available?: boolean | null;
          stairs?: boolean | null;
          special_items?: string | null;
          notes?: string | null;
          status?: "requested" | "reviewed" | "quote_provided" | "declined" | "cancelled";
          admin_notes?: string | null;
          quoted_amount?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["moving_requests"]["Insert"]>;
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: string;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          type?: string;
          read?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["notifications"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: "customer" | "staff" | "warehouse" | "driver" | "admin";
      region: "visayas" | "mindanao";
      request_status: "requested" | "reviewed" | "quote_provided" | "declined" | "cancelled";
      schedule_status: "scheduled" | "closed" | "completed" | "cancelled";
      moving_type: "house" | "office" | "condo";
      special_handling:
        | "fragile"
        | "medical"
        | "heavy"
        | "oversized"
        | "high_value"
        | "special_protection"
        | "other";
    };
    CompositeTypes: Record<string, never>;
  };
}
