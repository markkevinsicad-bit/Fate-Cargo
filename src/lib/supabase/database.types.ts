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
        Relationships: [
          {
            foreignKeyName: "quote_requests_destination_id_fkey";
            columns: ["destination_id"];
            isOneToOne: false;
            referencedRelation: "destinations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quote_requests_cargo_category_id_fkey";
            columns: ["cargo_category_id"];
            isOneToOne: false;
            referencedRelation: "cargo_categories";
            referencedColumns: ["id"];
          },
        ];
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
      loading_trips: {
        Row: {
          id: string;
          trip_number: string;
          region: "visayas" | "mindanao";
          destination_id: string | null;
          loading_schedule_id: string | null;
          loading_date: string;
          status: "planned" | "open" | "loading" | "departed" | "completed" | "cancelled";
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          trip_number: string;
          region: "visayas" | "mindanao";
          destination_id?: string | null;
          loading_schedule_id?: string | null;
          loading_date: string;
          status?: "planned" | "open" | "loading" | "departed" | "completed" | "cancelled";
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["loading_trips"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "loading_trips_destination_id_fkey";
            columns: ["destination_id"];
            isOneToOne: false;
            referencedRelation: "destinations";
            referencedColumns: ["id"];
          },
        ];
      };
      shipments: {
        Row: {
          id: string;
          fate_cargo_id: string;
          qr_token: string;
          customer_id: string;
          status:
            | "booked"
            | "awaiting_pickup"
            | "cargo_received"
            | "at_warehouse"
            | "consolidating"
            | "ready_for_loading"
            | "loaded"
            | "in_transit"
            | "at_destination_hub"
            | "out_for_delivery"
            | "delivered"
            | "cancelled"
            | "on_hold"
            | "issue_reported";
          service_id: string | null;
          origin_address: string;
          origin_city: string | null;
          origin_contact_name: string | null;
          origin_contact_phone: string | null;
          pickup_required: boolean;
          pickup_date: string | null;
          pickup_time: string | null;
          pickup_notes: string | null;
          destination_id: string | null;
          destination_address: string | null;
          recipient_name: string | null;
          recipient_phone: string | null;
          delivery_notes: string | null;
          cargo_category_id: string | null;
          cargo_description: string | null;
          number_of_packages: number | null;
          package_type: string | null;
          weight_kg: number | null;
          length_cm: number | null;
          width_cm: number | null;
          height_cm: number | null;
          volume_cbm: number | null;
          special_handling: string[];
          special_handling_notes: string | null;
          customer_notes: string | null;
          internal_notes: string | null;
          loading_trip_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          fate_cargo_id: string;
          qr_token: string;
          customer_id: string;
          status?: Database["public"]["Tables"]["shipments"]["Row"]["status"];
          service_id?: string | null;
          origin_address: string;
          origin_city?: string | null;
          origin_contact_name?: string | null;
          origin_contact_phone?: string | null;
          pickup_required?: boolean;
          pickup_date?: string | null;
          pickup_time?: string | null;
          pickup_notes?: string | null;
          destination_id?: string | null;
          destination_address?: string | null;
          recipient_name?: string | null;
          recipient_phone?: string | null;
          delivery_notes?: string | null;
          cargo_category_id?: string | null;
          cargo_description?: string | null;
          number_of_packages?: number | null;
          package_type?: string | null;
          weight_kg?: number | null;
          length_cm?: number | null;
          width_cm?: number | null;
          height_cm?: number | null;
          volume_cbm?: number | null;
          special_handling?: string[];
          special_handling_notes?: string | null;
          customer_notes?: string | null;
          internal_notes?: string | null;
          loading_trip_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["shipments"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "shipments_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shipments_service_id_fkey";
            columns: ["service_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shipments_destination_id_fkey";
            columns: ["destination_id"];
            isOneToOne: false;
            referencedRelation: "destinations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shipments_cargo_category_id_fkey";
            columns: ["cargo_category_id"];
            isOneToOne: false;
            referencedRelation: "cargo_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shipments_loading_trip_id_fkey";
            columns: ["loading_trip_id"];
            isOneToOne: false;
            referencedRelation: "loading_trips";
            referencedColumns: ["id"];
          },
        ];
      };
      shipment_tracking_events: {
        Row: {
          id: string;
          shipment_id: string;
          status: Database["public"]["Tables"]["shipments"]["Row"]["status"];
          title: string;
          description: string | null;
          location: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          shipment_id: string;
          status: Database["public"]["Tables"]["shipments"]["Row"]["status"];
          title: string;
          description?: string | null;
          location?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["shipment_tracking_events"]["Insert"]>;
        Relationships: [];
      };
      cargo_condition_records: {
        Row: {
          id: string;
          shipment_id: string;
          stage: "receiving" | "pre_loading" | "arrival" | "delivery";
          condition: string;
          packaging_condition: string | null;
          notes: string | null;
          photo_paths: string[];
          recorded_by: string | null;
          recorded_at: string;
        };
        Insert: {
          id?: string;
          shipment_id: string;
          stage: "receiving" | "pre_loading" | "arrival" | "delivery";
          condition: string;
          packaging_condition?: string | null;
          notes?: string | null;
          photo_paths?: string[];
          recorded_by?: string | null;
          recorded_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["cargo_condition_records"]["Insert"]>;
        Relationships: [];
      };
      qr_scan_logs: {
        Row: {
          id: string;
          shipment_id: string | null;
          scanned_by: string | null;
          scan_type: "validation" | "receiving" | "warehouse" | "loading" | "delivery";
          scan_result:
            | "success"
            | "invalid_token"
            | "not_found"
            | "unauthorized"
            | "already_processed"
            | "cancelled_shipment"
            | "error";
          operational_action: string | null;
          device_info: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          shipment_id?: string | null;
          scanned_by?: string | null;
          scan_type: "validation" | "receiving" | "warehouse" | "loading" | "delivery";
          scan_result:
            | "success"
            | "invalid_token"
            | "not_found"
            | "unauthorized"
            | "already_processed"
            | "cancelled_shipment"
            | "error";
          operational_action?: string | null;
          device_info?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["qr_scan_logs"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "qr_scan_logs_shipment_id_fkey";
            columns: ["shipment_id"];
            isOneToOne: false;
            referencedRelation: "shipments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "qr_scan_logs_scanned_by_fkey";
            columns: ["scanned_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_booking: {
        Args: { payload: Json };
        Returns: string;
      };
      update_shipment_status: {
        Args: {
          p_shipment_id: string;
          p_status: Database["public"]["Tables"]["shipments"]["Row"]["status"];
          p_location?: string | null;
          p_note?: string | null;
        };
        Returns: undefined;
      };
      receive_cargo: {
        Args: {
          p_shipment_id: string;
          p_condition: string;
          p_packaging_condition?: string | null;
          p_notes?: string | null;
          p_photo_paths?: string[];
        };
        Returns: string;
      };
      record_cargo_condition: {
        Args: {
          p_shipment_id: string;
          p_stage: "receiving" | "pre_loading" | "arrival" | "delivery";
          p_condition: string;
          p_packaging_condition?: string | null;
          p_notes?: string | null;
          p_photo_paths?: string[];
        };
        Returns: string;
      };
      assign_shipment_to_trip: {
        Args: { p_shipment_id: string; p_trip_id: string };
        Returns: undefined;
      };
      create_loading_trip: {
        Args: {
          p_region: "visayas" | "mindanao";
          p_loading_date: string;
          p_destination_id?: string | null;
          p_loading_schedule_id?: string | null;
          p_notes?: string | null;
        };
        Returns: string;
      };
      scan_qr_token: {
        Args: {
          p_token: string;
          p_scan_type: "validation" | "receiving" | "warehouse" | "loading" | "delivery";
          p_device_info?: string | null;
        };
        Returns: Json;
      };
      track_shipment_public: {
        Args: { p_fate_cargo_id: string };
        Returns: Json;
      };
    };
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
      cargo_condition_stage: "receiving" | "pre_loading" | "arrival" | "delivery";
      loading_trip_status: "planned" | "open" | "loading" | "departed" | "completed" | "cancelled";
      qr_scan_type: "validation" | "receiving" | "warehouse" | "loading" | "delivery";
      qr_scan_result:
        | "success"
        | "invalid_token"
        | "not_found"
        | "unauthorized"
        | "already_processed"
        | "cancelled_shipment"
        | "error";
    };
    CompositeTypes: Record<string, never>;
  };
}
