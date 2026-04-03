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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          target_id: string | null
          target_type: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          check_in: string | null
          check_in_lat: number | null
          check_in_lng: number | null
          check_in_location: string | null
          check_in_photo_url: string | null
          check_out: string | null
          check_out_lat: number | null
          check_out_lng: number | null
          check_out_location: string | null
          check_out_photo_url: string | null
          completed_tasks: string | null
          created_at: string | null
          created_by: string | null
          date: string
          id: string
          notes: string | null
          sessions: Json | null
          status: string
          task_completed: boolean | null
          task_description: string | null
          task_proof_urls: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          check_in?: string | null
          check_in_lat?: number | null
          check_in_lng?: number | null
          check_in_location?: string | null
          check_in_photo_url?: string | null
          check_out?: string | null
          check_out_lat?: number | null
          check_out_lng?: number | null
          check_out_location?: string | null
          check_out_photo_url?: string | null
          completed_tasks?: string | null
          created_at?: string | null
          created_by?: string | null
          date?: string
          id?: string
          notes?: string | null
          sessions?: Json | null
          status?: string
          task_completed?: boolean | null
          task_description?: string | null
          task_proof_urls?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          check_in?: string | null
          check_in_lat?: number | null
          check_in_lng?: number | null
          check_in_location?: string | null
          check_in_photo_url?: string | null
          check_out?: string | null
          check_out_lat?: number | null
          check_out_lng?: number | null
          check_out_location?: string | null
          check_out_photo_url?: string | null
          completed_tasks?: string | null
          created_at?: string | null
          created_by?: string | null
          date?: string
          id?: string
          notes?: string | null
          sessions?: Json | null
          status?: string
          task_completed?: boolean | null
          task_description?: string | null
          task_proof_urls?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_id: string | null
          author_name: string | null
          category: string | null
          content: string | null
          created_at: string | null
          excerpt: string | null
          featured: boolean | null
          featured_image_url: string | null
          id: string
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          read_time: string | null
          slug: string
          status: string
          tags: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          author_name?: string | null
          category?: string | null
          content?: string | null
          created_at?: string | null
          excerpt?: string | null
          featured?: boolean | null
          featured_image_url?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          read_time?: string | null
          slug: string
          status?: string
          tags?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          author_name?: string | null
          category?: string | null
          content?: string | null
          created_at?: string | null
          excerpt?: string | null
          featured?: boolean | null
          featured_image_url?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          read_time?: string | null
          slug?: string
          status?: string
          tags?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      career_jobs: {
        Row: {
          created_at: string | null
          department: string | null
          description: string | null
          id: string
          location: string | null
          requirements: string | null
          status: string
          title: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          description?: string | null
          id?: string
          location?: string | null
          requirements?: string | null
          status?: string
          title: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          description?: string | null
          id?: string
          location?: string | null
          requirements?: string | null
          status?: string
          title?: string
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      case_studies: {
        Row: {
          client_challenges: string | null
          client_name: string | null
          created_at: string | null
          design_process: string | null
          development_approach: string | null
          hero_image_url: string | null
          id: string
          industry: string | null
          metrics: string | null
          portfolio_id: string | null
          project_background: string | null
          research_strategy: string | null
          screenshots: Json | null
          slug: string
          status: string
          technologies: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          client_challenges?: string | null
          client_name?: string | null
          created_at?: string | null
          design_process?: string | null
          development_approach?: string | null
          hero_image_url?: string | null
          id?: string
          industry?: string | null
          metrics?: string | null
          portfolio_id?: string | null
          project_background?: string | null
          research_strategy?: string | null
          screenshots?: Json | null
          slug: string
          status?: string
          technologies?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          client_challenges?: string | null
          client_name?: string | null
          created_at?: string | null
          design_process?: string | null
          development_approach?: string | null
          hero_image_url?: string | null
          id?: string
          industry?: string | null
          metrics?: string | null
          portfolio_id?: string | null
          project_background?: string | null
          research_strategy?: string | null
          screenshots?: Json | null
          slug?: string
          status?: string
          technologies?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_studies_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: true
            referencedRelation: "portfolio_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      certificates: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          expiry_date: string | null
          id: string
          issue_date: string
          issued_by: string | null
          recipient_email: string | null
          recipient_name: string
          status: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          expiry_date?: string | null
          id: string
          issue_date?: string
          issued_by?: string | null
          recipient_email?: string | null
          recipient_name: string
          status?: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          expiry_date?: string | null
          id?: string
          issue_date?: string
          issued_by?: string | null
          recipient_email?: string | null
          recipient_name?: string
          status?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      company_letters: {
        Row: {
          content: Json
          created_at: string | null
          created_by: string | null
          docx_url: string | null
          id: string
          letter_type: string
          notes: string | null
          pdf_url: string | null
          recipient_id: string | null
          recipient_name: string
          status: string
          subject: string
          updated_at: string | null
        }
        Insert: {
          content?: Json
          created_at?: string | null
          created_by?: string | null
          docx_url?: string | null
          id: string
          letter_type: string
          notes?: string | null
          pdf_url?: string | null
          recipient_id?: string | null
          recipient_name: string
          status?: string
          subject: string
          updated_at?: string | null
        }
        Update: {
          content?: Json
          created_at?: string | null
          created_by?: string | null
          docx_url?: string | null
          id?: string
          letter_type?: string
          notes?: string | null
          pdf_url?: string | null
          recipient_id?: string | null
          recipient_name?: string
          status?: string
          subject?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_letters_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_letters_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      consultations: {
        Row: {
          budget: string | null
          company: string | null
          created_at: string | null
          date: string
          email: string
          id: string
          name: string
          project_desc: string
          status: string
          time: string
          timeline: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          budget?: string | null
          company?: string | null
          created_at?: string | null
          date: string
          email: string
          id?: string
          name: string
          project_desc: string
          status?: string
          time: string
          timeline?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          budget?: string | null
          company?: string | null
          created_at?: string | null
          date?: string
          email?: string
          id?: string
          name?: string
          project_desc?: string
          status?: string
          time?: string
          timeline?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      contacts: {
        Row: {
          budget: string | null
          client_id: string | null
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          service: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          budget?: string | null
          client_id?: string | null
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          service?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          budget?: string | null
          client_id?: string | null
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          service?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          description: string
          display_order: number | null
          id: string
          invoice_id: string
          quantity: number
          total: number
          unit_price: number
        }
        Insert: {
          description: string
          display_order?: number | null
          id?: string
          invoice_id: string
          quantity?: number
          total?: number
          unit_price?: number
        }
        Update: {
          description?: string
          display_order?: number | null
          id?: string
          invoice_id?: string
          quantity?: number
          total?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          client_id: string | null
          created_at: string | null
          created_by: string | null
          discount: number | null
          due_date: string | null
          id: string
          issue_date: string
          notes: string | null
          pdf_url: string | null
          status: string
          subtotal: number
          tax_rate: number | null
          total: number
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          discount?: number | null
          due_date?: string | null
          id: string
          issue_date?: string
          notes?: string | null
          pdf_url?: string | null
          status?: string
          subtotal?: number
          tax_rate?: number | null
          total?: number
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          discount?: number | null
          due_date?: string | null
          id?: string
          issue_date?: string
          notes?: string | null
          pdf_url?: string | null
          status?: string
          subtotal?: number
          tax_rate?: number | null
          total?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_projects: {
        Row: {
          category: string | null
          client: string | null
          created_at: string | null
          display_order: number | null
          featured_image_url: string | null
          github_url: string | null
          id: string
          industry: string | null
          is_featured: boolean | null
          live_url: string | null
          name: string
          short_description: string | null
          slug: string | null
          summary: string | null
          tech_stack: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          client?: string | null
          created_at?: string | null
          display_order?: number | null
          featured_image_url?: string | null
          github_url?: string | null
          id?: string
          industry?: string | null
          is_featured?: boolean | null
          live_url?: string | null
          name: string
          short_description?: string | null
          slug?: string | null
          summary?: string | null
          tech_stack?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          client?: string | null
          created_at?: string | null
          display_order?: number | null
          featured_image_url?: string | null
          github_url?: string | null
          id?: string
          industry?: string | null
          is_featured?: boolean | null
          live_url?: string | null
          name?: string
          short_description?: string | null
          slug?: string | null
          summary?: string | null
          tech_stack?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      pricing_plans: {
        Row: {
          created_at: string | null
          cta_text: string | null
          description: string | null
          display_order: number | null
          features: string | null
          id: string
          is_active: boolean | null
          is_recommended: boolean | null
          name: string
          price_pkr: string | null
          price_usd: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          cta_text?: string | null
          description?: string | null
          display_order?: number | null
          features?: string | null
          id?: string
          is_active?: boolean | null
          is_recommended?: boolean | null
          name: string
          price_pkr?: string | null
          price_usd?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          cta_text?: string | null
          description?: string | null
          display_order?: number | null
          features?: string | null
          id?: string
          is_active?: boolean | null
          is_recommended?: boolean | null
          name?: string
          price_pkr?: string | null
          price_usd?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          role: string
          status: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          role?: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          benefits: string | null
          category: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          icon_name: string | null
          id: string
          is_active: boolean | null
          name: string
          tech_stack: string | null
          updated_at: string | null
        }
        Insert: {
          benefits?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          tech_stack?: string | null
          updated_at?: string | null
        }
        Update: {
          benefits?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          tech_stack?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string | null
          value: Json | null
        }
        Insert: {
          key: string
          updated_at?: string | null
          value?: Json | null
        }
        Update: {
          key?: string
          updated_at?: string | null
          value?: Json | null
        }
        Relationships: []
      }
      staff_announcement_reads: {
        Row: {
          announcement_id: string
          id: string
          read_at: string | null
          user_id: string
        }
        Insert: {
          announcement_id: string
          id?: string
          read_at?: string | null
          user_id: string
        }
        Update: {
          announcement_id?: string
          id?: string
          read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_announcement_reads_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "staff_announcements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_announcement_reads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_announcements: {
        Row: {
          body: string
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          priority: string
          scheduled_date: string | null
          target_user_ids: string[] | null
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          body: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          priority?: string
          scheduled_date?: string | null
          target_user_ids?: string[] | null
          title: string
          type?: string
          updated_at?: string | null
        }
        Update: {
          body?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          priority?: string
          scheduled_date?: string | null
          target_user_ids?: string[] | null
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_announcements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_locations: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          lat: number | null
          lng: number | null
          name: string
          radius_meters: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          lat?: number | null
          lng?: number | null
          name: string
          radius_meters?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          lat?: number | null
          lng?: number | null
          name?: string
          radius_meters?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_locations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          created_at: string | null
          department: string | null
          display_order: number | null
          experience: string | null
          full_name: string
          github_url: string | null
          id: string
          is_active: boolean | null
          linkedin_url: string | null
          photo_url: string | null
          role: string
          skills: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          display_order?: number | null
          experience?: string | null
          full_name: string
          github_url?: string | null
          id?: string
          is_active?: boolean | null
          linkedin_url?: string | null
          photo_url?: string | null
          role: string
          skills?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          display_order?: number | null
          experience?: string | null
          full_name?: string
          github_url?: string | null
          id?: string
          is_active?: boolean | null
          linkedin_url?: string | null
          photo_url?: string | null
          role?: string
          skills?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          client_name: string
          company: string | null
          created_at: string | null
          display_order: number | null
          id: string
          is_visible: boolean | null
          photo_url: string | null
          quote: string
          rating: number | null
          role: string | null
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          client_name: string
          company?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_visible?: boolean | null
          photo_url?: string | null
          quote: string
          rating?: number | null
          role?: string | null
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          client_name?: string
          company?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_visible?: boolean | null
          photo_url?: string | null
          quote?: string
          rating?: number | null
          role?: string | null
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          image: string | null
          name: string | null
          token_identifier: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          image?: string | null
          name?: string | null
          token_identifier: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          image?: string | null
          name?: string | null
          token_identifier?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
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
