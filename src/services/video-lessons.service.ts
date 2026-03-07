/**
 * Video Lessons Service
 * Handles video CRUD operations with Appwrite
 */

import { ID, Query } from "react-native-appwrite";
import { DATABASE_ID, databases } from "./appwrite";

const COLLECTION_ID = "video_lessons";

export interface VideoLesson {
  $id: string;
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
  created_at: string;
  updated_at: string;
}

export const videoLessonsService = {
  // Get all videos for a topic
  async getVideosByTopic(topicId: string): Promise<VideoLesson[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [
          Query.equal("topic_id", topicId),
          Query.equal("is_active", true),
          Query.orderAsc("order_index"),
        ]
      );
      return response.documents as VideoLesson[];
    } catch (error) {
      console.error("Error fetching videos:", error);
      return [];
    }
  },

  // Get single video
  async getVideo(videoId: string): Promise<VideoLesson | null> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [Query.equal("video_id", videoId)]
      );
      return response.documents[0] as VideoLesson || null;
    } catch (error) {
      console.error("Error fetching video:", error);
      return null;
    }
  },

  // Create video (admin only)
  async createVideo(video: Omit<VideoLesson, "$id" | "created_at" | "updated_at">): Promise<VideoLesson> {
    const now = new Date().toISOString();
    const response = await databases.createDocument(
      DATABASE_ID,
      COLLECTION_ID,
      ID.unique(),
      {
        ...video,
        created_at: now,
        updated_at: now,
      }
    );
    return response as VideoLesson;
  },

  // Update video (admin only)
  async updateVideo(documentId: string, updates: Partial<VideoLesson>): Promise<VideoLesson> {
    const response = await databases.updateDocument(
      DATABASE_ID,
      COLLECTION_ID,
      documentId,
      {
        ...updates,
        updated_at: new Date().toISOString(),
      }
    );
    return response as VideoLesson;
  },

  // Delete video (admin only)
  async deleteVideo(documentId: string): Promise<void> {
    await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, documentId);
  },

  // Toggle video active status
  async toggleActive(documentId: string, isActive: boolean): Promise<VideoLesson> {
    return this.updateVideo(documentId, { is_active: isActive });
  },

  // Get all videos (admin only)
  async getAllVideos(): Promise<VideoLesson[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [Query.orderAsc("topic_id"), Query.orderAsc("order_index")]
      );
      return response.documents as VideoLesson[];
    } catch (error) {
      console.error("Error fetching all videos:", error);
      return [];
    }
  },
};

// Helper functions
export function getYouTubeThumbnail(youtubeId: string, quality: "default" | "medium" | "high" | "maxres" = "medium"): string {
  return `https://img.youtube.com/vi/${youtubeId}/${quality}default.jpg`;
}

export function getYouTubeUrl(youtubeId: string): string {
  return `https://www.youtube.com/watch?v=${youtubeId}`;
}

export function formatDuration(duration: string): string {
  const parts = duration.split(":");
  if (parts.length === 2) {
    return `${parts[0]}m ${parts[1]}s`;
  } else if (parts.length === 3) {
    return `${parts[0]}h ${parts[1]}m`;
  }
  return duration;
}
