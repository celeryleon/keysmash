export type PassageType = "ai" | "classic";

export type Database = {
  public: {
    Tables: {
      passages: {
        Row: {
          id: string;
          date: string;
          type: PassageType;
          content: string;
          title: string | null;
          author: string | null;
          source: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          type: PassageType;
          content: string;
          title?: string | null;
          author?: string | null;
          source?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          type?: PassageType;
          content?: string;
          title?: string | null;
          author?: string | null;
          source?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      attempts: {
        Row: {
          id: string;
          user_id: string;
          passage_id: string;
          wpm: number;
          accuracy: number;
          time_elapsed: number;
          completed_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          passage_id: string;
          wpm: number;
          accuracy: number;
          time_elapsed: number;
          completed_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          passage_id?: string;
          wpm?: number;
          accuracy?: number;
          time_elapsed?: number;
          completed_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "attempts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "attempts_passage_id_fkey";
            columns: ["passage_id"];
            isOneToOne: false;
            referencedRelation: "passages";
            referencedColumns: ["id"];
          }
        ];
      };
      duels: {
        Row: {
          id: string;
          passage_index: number;
          challenger_wpm: number;
          challengee_wpm: number | null;
          created_at: string;
          expires_at: string;
          challenger_user_id: string | null;
          intended_opponent_user_id: string | null;
          challengee_user_id: string | null;
        };
        Insert: {
          id?: string;
          passage_index: number;
          challenger_wpm: number;
          challengee_wpm?: number | null;
          created_at?: string;
          expires_at?: string;
          challenger_user_id?: string | null;
          intended_opponent_user_id?: string | null;
          challengee_user_id?: string | null;
        };
        Update: {
          id?: string;
          passage_index?: number;
          challenger_wpm?: number;
          challengee_wpm?: number | null;
          created_at?: string;
          expires_at?: string;
          challenger_user_id?: string | null;
          intended_opponent_user_id?: string | null;
          challengee_user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "duels_challenger_user_id_fkey";
            columns: ["challenger_user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "duels_intended_opponent_user_id_fkey";
            columns: ["intended_opponent_user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "duels_challengee_user_id_fkey";
            columns: ["challengee_user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      profiles: {
        Row: {
          id: string;
          username: string | null;
          created_at: string;
          current_streak: number;
          longest_streak: number;
          last_attempt_date: string | null;
        };
        Insert: {
          id: string;
          username?: string | null;
          created_at?: string;
          current_streak?: number;
          longest_streak?: number;
          last_attempt_date?: string | null;
        };
        Update: {
          id?: string;
          username?: string | null;
          created_at?: string;
          current_streak?: number;
          longest_streak?: number;
          last_attempt_date?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Passage = Database["public"]["Tables"]["passages"]["Row"];
export type Attempt = Database["public"]["Tables"]["attempts"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Duel = Database["public"]["Tables"]["duels"]["Row"];
