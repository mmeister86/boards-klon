export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      columns: {
        Row: {
          id: string
          title: string
          position: number
          created_at?: string
        }
        Insert: {
          id?: string
          title: string
          position: number
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          position?: number
          created_at?: string
        }
      }
      items: {
        Row: {
          id: string
          content: string
          column_id: string
          created_at?: string
        }
        Insert: {
          id?: string
          content: string
          column_id: string
          created_at?: string
        }
        Update: {
          id?: string
          content?: string
          column_id?: string
          created_at?: string
        }
      }
      media_items: {
        Row: {
          id: string
          file_name: string
          file_type: string
          url: string
          size: number
          width: number
          height: number
          user_id: string
          uploaded_at: string
        }
        Insert: {
          id?: string
          file_name: string
          file_type: string
          url: string
          size: number
          width: number
          height: number
          user_id: string
          uploaded_at?: string
        }
        Update: {
          id?: string
          file_name?: string
          file_type?: string
          url?: string
          size?: number
          width?: number
          height?: number
          user_id?: string
          uploaded_at?: string
        }
      }
      // Add other tables as needed
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
  }
}
