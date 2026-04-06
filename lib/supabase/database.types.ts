export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      favorites: {
        Row: {
          created_at: string;
          profile_id: string;
          property_id: string;
        };
        Insert: {
          created_at?: string;
          profile_id: string;
          property_id: string;
        };
        Update: {
          created_at?: string;
          profile_id?: string;
          property_id?: string;
        };
        Relationships: [];
      };
      lead_property_interests: {
        Row: {
          created_at: string;
          id: string;
          lead_id: string;
          property_id: string;
          source_context: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          lead_id: string;
          property_id: string;
          source_context?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          lead_id?: string;
          property_id?: string;
          source_context?: string;
        };
        Relationships: [];
      };
      lead_status_history: {
        Row: {
          changed_at: string;
          id: string;
          lead_id: string;
          note: string | null;
          status: Database["public"]["Enums"]["lead_status"];
        };
        Insert: {
          changed_at?: string;
          id?: string;
          lead_id: string;
          note?: string | null;
          status: Database["public"]["Enums"]["lead_status"];
        };
        Update: {
          changed_at?: string;
          id?: string;
          lead_id?: string;
          note?: string | null;
          status?: Database["public"]["Enums"]["lead_status"];
        };
        Relationships: [];
      };
      leads: {
        Row: {
          consent_captured_at: string | null;
          consent_contact: boolean;
          consent_privacy_version: string | null;
          consent_source: string | null;
          created_at: string;
          current_status: Database["public"]["Enums"]["lead_status"];
          email: string | null;
          full_name: string;
          id: string;
          meeting_interest: boolean;
          message: string | null;
          phone: string;
          preferred_language: Database["public"]["Enums"]["language_code"];
          profile_id: string | null;
          source: Database["public"]["Enums"]["lead_source"];
          source_path: string | null;
          updated_by: string | null;
        };
        Insert: {
          consent_captured_at?: string | null;
          consent_contact?: boolean;
          consent_privacy_version?: string | null;
          consent_source?: string | null;
          created_at?: string;
          current_status?: Database["public"]["Enums"]["lead_status"];
          email?: string | null;
          full_name: string;
          id?: string;
          meeting_interest?: boolean;
          message?: string | null;
          phone: string;
          preferred_language?: Database["public"]["Enums"]["language_code"];
          profile_id?: string | null;
          source?: Database["public"]["Enums"]["lead_source"];
          source_path?: string | null;
          updated_by?: string | null;
        };
        Update: {
          consent_captured_at?: string | null;
          consent_contact?: boolean;
          consent_privacy_version?: string | null;
          consent_source?: string | null;
          created_at?: string;
          current_status?: Database["public"]["Enums"]["lead_status"];
          email?: string | null;
          full_name?: string;
          id?: string;
          meeting_interest?: boolean;
          message?: string | null;
          phone?: string;
          preferred_language?: Database["public"]["Enums"]["language_code"];
          profile_id?: string | null;
          source?: Database["public"]["Enums"]["lead_source"];
          source_path?: string | null;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          email: string | null;
          full_name: string | null;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
        };
        Insert: {
          email?: string | null;
          full_name?: string | null;
          id: string;
          role?: Database["public"]["Enums"]["app_role"];
        };
        Update: {
          email?: string | null;
          full_name?: string | null;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
        };
        Relationships: [];
      };
      projects: {
        Row: {
          approximate_location_text: string | null;
          created_at: string;
          created_by: string | null;
          description: string | null;
          headline: string | null;
          id: string;
          is_featured: boolean;
          name: string;
          published_at: string | null;
          slug: string;
          sort_order: number;
          status: Database["public"]["Enums"]["project_status"];
          summary: string | null;
          updated_by: string | null;
          whatsapp_phone: string | null;
        };
        Insert: {
          approximate_location_text?: string | null;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          headline?: string | null;
          id?: string;
          is_featured?: boolean;
          name: string;
          published_at?: string | null;
          slug: string;
          sort_order?: number;
          status?: Database["public"]["Enums"]["project_status"];
          summary?: string | null;
          updated_by?: string | null;
          whatsapp_phone?: string | null;
        };
        Update: {
          approximate_location_text?: string | null;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          headline?: string | null;
          id?: string;
          is_featured?: boolean;
          name?: string;
          published_at?: string | null;
          slug?: string;
          sort_order?: number;
          status?: Database["public"]["Enums"]["project_status"];
          summary?: string | null;
          updated_by?: string | null;
          whatsapp_phone?: string | null;
        };
        Relationships: [];
      };
      properties: {
        Row: {
          approximate_location_text: string | null;
          base_currency: string;
          bathrooms: number | null;
          bedrooms: number | null;
          commercial_status: Database["public"]["Enums"]["property_status"];
          construction_area_m2: number | null;
          created_at: string;
          created_by: string | null;
          description: string | null;
          id: string;
          is_featured: boolean;
          listing_mode: Database["public"]["Enums"]["listing_mode"];
          lot_area_m2: number | null;
          parking_spaces: number | null;
          price_amount: number | null;
          price_mode: Database["public"]["Enums"]["price_mode"];
          project_id: string | null;
          property_type_id: string;
          published_at: string | null;
          slug: string;
          summary: string | null;
          title: string;
          updated_by: string | null;
          whatsapp_phone: string | null;
        };
        Insert: {
          approximate_location_text?: string | null;
          base_currency: string;
          bathrooms?: number | null;
          bedrooms?: number | null;
          commercial_status?: Database["public"]["Enums"]["property_status"];
          construction_area_m2?: number | null;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          is_featured?: boolean;
          listing_mode: Database["public"]["Enums"]["listing_mode"];
          lot_area_m2?: number | null;
          parking_spaces?: number | null;
          price_amount?: number | null;
          price_mode?: Database["public"]["Enums"]["price_mode"];
          project_id?: string | null;
          property_type_id: string;
          published_at?: string | null;
          slug: string;
          summary?: string | null;
          title: string;
          updated_by?: string | null;
          whatsapp_phone?: string | null;
        };
        Update: {
          approximate_location_text?: string | null;
          base_currency?: string;
          bathrooms?: number | null;
          bedrooms?: number | null;
          commercial_status?: Database["public"]["Enums"]["property_status"];
          construction_area_m2?: number | null;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          is_featured?: boolean;
          listing_mode?: Database["public"]["Enums"]["listing_mode"];
          lot_area_m2?: number | null;
          parking_spaces?: number | null;
          price_amount?: number | null;
          price_mode?: Database["public"]["Enums"]["price_mode"];
          project_id?: string | null;
          property_type_id?: string;
          published_at?: string | null;
          slug?: string;
          summary?: string | null;
          title?: string;
          updated_by?: string | null;
          whatsapp_phone?: string | null;
        };
        Relationships: [];
      };
      property_media: {
        Row: {
          alt_text: string | null;
          caption: string | null;
          id: string;
          is_cover: boolean;
          property_id: string;
          sort_order: number;
          storage_bucket: string;
          storage_path: string;
        };
        Insert: {
          alt_text?: string | null;
          caption?: string | null;
          id?: string;
          is_cover?: boolean;
          property_id: string;
          sort_order?: number;
          storage_bucket?: string;
          storage_path: string;
        };
        Update: {
          alt_text?: string | null;
          caption?: string | null;
          id?: string;
          is_cover?: boolean;
          property_id?: string;
          sort_order?: number;
          storage_bucket?: string;
          storage_path?: string;
        };
        Relationships: [];
      };
      property_types: {
        Row: {
          id: string;
          label_en: string;
          label_es: string;
          slug: string;
        };
        Insert: {
          id?: string;
          label_en: string;
          label_es: string;
          slug: string;
        };
        Update: {
          id?: string;
          label_en?: string;
          label_es?: string;
          slug?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      app_role: "broker_admin" | "client_user";
      language_code: "es" | "en";
      lead_source: "public_form" | "authenticated_interest" | "admin_manual";
      lead_status:
        | "new"
        | "contacted"
        | "qualified"
        | "meeting_requested"
        | "meeting_scheduled"
        | "negotiation"
        | "closed_won"
        | "closed_lost"
        | "archived";
      listing_mode: "sale" | "rent" | "sale_rent";
      price_mode: "fixed" | "on_request";
      project_status: "draft" | "published" | "archived";
      property_status: "available" | "reserved" | "sold" | "rented" | "hidden";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
