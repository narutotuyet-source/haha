export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      trips: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          start_date: string | null
          end_date: string | null
          budget: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          start_date?: string | null
          end_date?: string | null
          budget?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          start_date?: string | null
          end_date?: string | null
          budget?: number
          created_at?: string
          updated_at?: string
        }
      }
      destinations: {
        Row: {
          id: string
          trip_id: string
          place_id: string | null
          name: string
          address: string | null
          latitude: number
          longitude: number
          category: string
          estimated_cost: number
          opening_hours: Json | null
          images: Json | null
          order_index: number
          estimated_time_hours: number
          number_of_travelers: number
          created_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          place_id?: string | null
          name: string
          address?: string | null
          latitude: number
          longitude: number
          category?: string
          estimated_cost?: number
          opening_hours?: Json | null
          images?: Json | null
          order_index?: number
          estimated_time_hours?: number
          number_of_travelers?: number
          created_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          place_id?: string | null
          name?: string
          address?: string | null
          latitude?: number
          longitude?: number
          category?: string
          estimated_cost?: number
          opening_hours?: Json | null
          images?: Json | null
          order_index?: number
          estimated_time_hours?: number
          number_of_travelers?: number
          created_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          trip_id: string
          destination_id: string | null
          category: string
          amount: number
          description: string | null
          expense_date: string
          created_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          destination_id?: string | null
          category: string
          amount: number
          description?: string | null
          expense_date?: string
          created_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          destination_id?: string | null
          category?: string
          amount?: number
          description?: string | null
          expense_date?: string
          created_at?: string
        }
      }
      videos: {
        Row: {
          id: string
          destination_id: string
          video_url: string
          video_id: string | null
          title: string | null
          thumbnail_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          destination_id: string
          video_url: string
          video_id?: string | null
          title?: string | null
          thumbnail_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          destination_id?: string
          video_url?: string
          video_id?: string | null
          title?: string | null
          thumbnail_url?: string | null
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          destination_id: string
          user_id: string
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          destination_id: string
          user_id: string
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          destination_id?: string
          user_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
        }
      }
    }
  }
}
