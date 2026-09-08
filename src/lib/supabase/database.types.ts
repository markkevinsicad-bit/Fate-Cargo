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
          is_active: boolean;
          referral_code: string | null;
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
          is_active?: boolean;
          referral_code?: string | null;
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
          organization_id: string | null;
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
          organization_id?: string | null;
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
      pickups: {
        Row: {
          id: string;
          shipment_id: string;
          pickup_reference: string;
          scheduled_date: string | null;
          scheduled_time: string | null;
          pickup_address: string;
          pickup_contact_name: string | null;
          pickup_contact_phone: string | null;
          assigned_driver_id: string | null;
          status: "requested" | "scheduled" | "assigned" | "out_for_pickup" | "arrived" | "picked_up" | "failed" | "cancelled";
          notes: string | null;
          proof_condition: string | null;
          proof_photo_paths: string[];
          proof_notes: string | null;
          picked_up_at: string | null;
          picked_up_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          shipment_id: string;
          pickup_reference: string;
          scheduled_date?: string | null;
          scheduled_time?: string | null;
          pickup_address: string;
          pickup_contact_name?: string | null;
          pickup_contact_phone?: string | null;
          assigned_driver_id?: string | null;
          status?: Database["public"]["Tables"]["pickups"]["Row"]["status"];
          notes?: string | null;
          proof_condition?: string | null;
          proof_photo_paths?: string[];
          proof_notes?: string | null;
          picked_up_at?: string | null;
          picked_up_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["pickups"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "pickups_shipment_id_fkey";
            columns: ["shipment_id"];
            isOneToOne: true;
            referencedRelation: "shipments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "pickups_assigned_driver_id_fkey";
            columns: ["assigned_driver_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      deliveries: {
        Row: {
          id: string;
          shipment_id: string;
          delivery_reference: string;
          assigned_driver_id: string | null;
          destination_address: string;
          recipient_name: string | null;
          recipient_phone: string | null;
          scheduled_date: string | null;
          status: "pending_assignment" | "assigned" | "out_for_delivery" | "arrived" | "delivered" | "failed" | "return_required";
          delivery_notes: string | null;
          pod_photo_path: string | null;
          pod_recipient_name: string | null;
          pod_notes: string | null;
          delivered_at: string | null;
          delivered_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          shipment_id: string;
          delivery_reference: string;
          assigned_driver_id?: string | null;
          destination_address: string;
          recipient_name?: string | null;
          recipient_phone?: string | null;
          scheduled_date?: string | null;
          status?: Database["public"]["Tables"]["deliveries"]["Row"]["status"];
          delivery_notes?: string | null;
          pod_photo_path?: string | null;
          pod_recipient_name?: string | null;
          pod_notes?: string | null;
          delivered_at?: string | null;
          delivered_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["deliveries"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "deliveries_shipment_id_fkey";
            columns: ["shipment_id"];
            isOneToOne: true;
            referencedRelation: "shipments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "deliveries_assigned_driver_id_fkey";
            columns: ["assigned_driver_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      business_organizations: {
        Row: {
          id: string;
          name: string;
          contact_email: string | null;
          contact_phone: string | null;
          billing_address: string | null;
          is_active: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          contact_email?: string | null;
          contact_phone?: string | null;
          billing_address?: string | null;
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["business_organizations"]["Insert"]>;
        Relationships: [];
      };
      business_organization_members: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string;
          org_role: "member" | "manager" | "owner";
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          user_id: string;
          org_role?: "member" | "manager" | "owner";
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["business_organization_members"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "business_organization_members_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "business_organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "business_organization_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      saved_addresses: {
        Row: {
          id: string;
          customer_id: string | null;
          organization_id: string | null;
          label: string;
          address_type: "pickup" | "delivery" | "both";
          address: string;
          contact_name: string | null;
          contact_phone: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          customer_id?: string | null;
          organization_id?: string | null;
          label: string;
          address_type?: "pickup" | "delivery" | "both";
          address: string;
          contact_name?: string | null;
          contact_phone?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["saved_addresses"]["Insert"]>;
        Relationships: [];
      };
      leads: {
        Row: {
          id: string;
          full_name: string;
          phone: string;
          email: string | null;
          origin: string | null;
          destination: string | null;
          cargo_type: string | null;
          estimated_size: string | null;
          preferred_service_id: string | null;
          notes: string | null;
          status: "new" | "contacted" | "quoted" | "converted" | "lost";
          internal_notes: string | null;
          follow_up_date: string | null;
          converted_shipment_id: string | null;
          referral_code_used: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          phone: string;
          email?: string | null;
          origin?: string | null;
          destination?: string | null;
          cargo_type?: string | null;
          estimated_size?: string | null;
          preferred_service_id?: string | null;
          notes?: string | null;
          status?: Database["public"]["Tables"]["leads"]["Row"]["status"];
          internal_notes?: string | null;
          follow_up_date?: string | null;
          converted_shipment_id?: string | null;
          referral_code_used?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["leads"]["Insert"]>;
        Relationships: [];
      };
      referrals: {
        Row: {
          id: string;
          referrer_id: string;
          referred_id: string;
          referral_code: string;
          converted: boolean;
          converted_shipment_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          referrer_id: string;
          referred_id: string;
          referral_code: string;
          converted?: boolean;
          converted_shipment_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["referrals"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "referrals_referrer_id_fkey";
            columns: ["referrer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "referrals_referred_id_fkey";
            columns: ["referred_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      referral_settings: {
        Row: {
          id: boolean;
          reward_description: string;
          is_active: boolean;
          updated_at: string;
        };
        Insert: {
          id?: boolean;
          reward_description?: string;
          is_active?: boolean;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["referral_settings"]["Insert"]>;
        Relationships: [];
      };
      reviews: {
        Row: {
          id: string;
          shipment_id: string;
          customer_id: string;
          rating: number;
          comment: string | null;
          is_visible: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          shipment_id: string;
          customer_id: string;
          rating: number;
          comment?: string | null;
          is_visible?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["reviews"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "reviews_shipment_id_fkey";
            columns: ["shipment_id"];
            isOneToOne: true;
            referencedRelation: "shipments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      audit_logs: {
        Row: {
          id: string;
          actor_id: string | null;
          actor_role: "customer" | "staff" | "warehouse" | "driver" | "admin" | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          actor_role?: "customer" | "staff" | "warehouse" | "driver" | "admin" | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["audit_logs"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey";
            columns: ["actor_id"];
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
      create_pickup_request: {
        Args: {
          p_shipment_id: string;
          p_pickup_address: string;
          p_scheduled_date?: string | null;
          p_scheduled_time?: string | null;
          p_pickup_contact_name?: string | null;
          p_pickup_contact_phone?: string | null;
          p_notes?: string | null;
        };
        Returns: string;
      };
      assign_pickup_driver: {
        Args: { p_pickup_id: string; p_driver_id: string };
        Returns: undefined;
      };
      driver_update_pickup_status: {
        Args: {
          p_pickup_id: string;
          p_status: "requested" | "scheduled" | "assigned" | "out_for_pickup" | "arrived" | "failed" | "cancelled";
        };
        Returns: undefined;
      };
      complete_pickup: {
        Args: {
          p_pickup_id: string;
          p_condition: string;
          p_notes?: string | null;
          p_photo_paths?: string[];
        };
        Returns: undefined;
      };
      create_delivery_assignment: {
        Args: {
          p_shipment_id: string;
          p_destination_address: string;
          p_recipient_name?: string | null;
          p_recipient_phone?: string | null;
          p_scheduled_date?: string | null;
          p_notes?: string | null;
        };
        Returns: string;
      };
      assign_delivery_driver: {
        Args: { p_delivery_id: string; p_driver_id: string };
        Returns: undefined;
      };
      driver_update_delivery_status: {
        Args: {
          p_delivery_id: string;
          p_status: "pending_assignment" | "assigned" | "out_for_delivery" | "arrived" | "failed" | "return_required";
        };
        Returns: undefined;
      };
      complete_delivery: {
        Args: {
          p_delivery_id: string;
          p_recipient_name: string;
          p_photo_path?: string | null;
          p_notes?: string | null;
        };
        Returns: undefined;
      };
      get_or_create_referral_code: {
        Args: Record<string, never>;
        Returns: string;
      };
      redeem_referral_code: {
        Args: { p_code: string };
        Returns: undefined;
      };
      submit_review: {
        Args: { p_shipment_id: string; p_rating: number; p_comment?: string | null };
        Returns: string;
      };
      log_audit_event: {
        Args: {
          p_action: string;
          p_entity_type: string;
          p_entity_id?: string | null;
          p_metadata?: Json;
        };
        Returns: undefined;
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
      pickup_status:
        | "requested"
        | "scheduled"
        | "assigned"
        | "out_for_pickup"
        | "arrived"
        | "picked_up"
        | "failed"
        | "cancelled";
      delivery_status:
        | "pending_assignment"
        | "assigned"
        | "out_for_delivery"
        | "arrived"
        | "delivered"
        | "failed"
        | "return_required";
      lead_status: "new" | "contacted" | "quoted" | "converted" | "lost";
      org_member_role: "member" | "manager" | "owner";
      saved_address_type: "pickup" | "delivery" | "both";
    };
    CompositeTypes: Record<string, never>;
  };
}
