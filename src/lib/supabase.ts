import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      cars: {
        Row: {
          id: string;
          user_id: string;
          make: string;
          model: string;
          year: number;
          license_plate: string;
          vin?: string;
          image_url?: string;
          created_at: string;
          updated_at: string;
          is_archived: boolean;
        };
        Insert: Omit<
          Database["public"]["Tables"]["cars"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["cars"]["Insert"]>;
      };
      services: {
        Row: {
          id: string;
          car_id: string;
          service_type: string;
          description?: string;
          date: string;
          cost: number;
          invoice_url?: string;
          odometer?: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["services"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["services"]["Insert"]>;
      };
      reminders: {
        Row: {
          id: string;
          car_id: string;
          title: string;
          description?: string;
          due_date: string;
          is_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["reminders"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["reminders"]["Insert"]>;
      };
      insurance: {
        Row: {
          id: string;
          car_id: string;
          provider: string;
          policy_number: string;
          expiry_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["insurance"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["insurance"]["Insert"]>;
      };
      fuel_logs: {
        Row: {
          id: string;
          car_id: string;
          date: string;
          volume: number;
          cost_per_liter: number;
          total_cost: number;
          station_name?: string;
          location?: string;
          odometer?: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["fuel_logs"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["fuel_logs"]["Insert"]>;
      };
      expenses: {
        Row: {
          id: string;
          car_id: string;
          category: string;
          date: string;
          amount: number;
          description?: string;
          receipt_url?: string;
          notes?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["expenses"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["expenses"]["Insert"]>;
      };
    };
  };
};
