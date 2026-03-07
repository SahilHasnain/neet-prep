/**
 * Shared Video Types
 * Used by both mobile and admin apps
 */

export interface VideoLesson {
  $id?: string;
  video_id: string;
  topic_id: string;
  title: string;
  channel: string;
  youtube_id: string;
  duration: string;
  description?: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  language: "english" | "hindi" | "both";
  is_active: boolean;
  order_index: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateVideoInput extends Omit<VideoLesson, "$id" | "created_at" | "updated_at"> {}

export interface UpdateVideoInput extends Partial<CreateVideoInput> {
  $id: string;
}
