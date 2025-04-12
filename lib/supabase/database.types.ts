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
          uploaded_at: string | null
          size: number
          width: number | null
          height: number | null
          user_id: string | null
          preview_url: string | null
          preview_url_512: string | null
          preview_url_128: string | null
        }
        Insert: {
          id?: string
          file_name: string
          file_type: string
          url: string
          uploaded_at?: string | null
          size: number
          width?: number | null
          height?: number | null
          user_id?: string | null
          preview_url?: string | null
          preview_url_512?: string | null
          preview_url_128?: string | null
        }
        Update: {
          id?: string
          file_name?: string
          file_type?: string
          url?: string
          uploaded_at?: string | null
          size?: number
          width?: number | null
          height?: number | null
          user_id?: string | null
          preview_url?: string | null
          preview_url_512?: string | null
          preview_url_128?: string | null
        }
      }
      published_boards: {
        Row: {
          id: string
          project_id: string
          title: string
          author_name: string
          user_id: string
          published_at: string
          updated_at: string
          is_published: boolean
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          author_name: string
          user_id: string
          published_at?: string
          updated_at?: string
          is_published?: boolean
        }
        Update: {
          id?: string
          project_id?: string
          title?: string
          author_name?: string
          user_id?: string
          published_at?: string
          updated_at?: string
          is_published?: boolean
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
