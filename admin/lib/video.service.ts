/**
 * Video Service for Admin Panel
 */

import { ID, Query } from "node-appwrite";
import { VideoLesson } from "../../shared/types/video.types";
import { COLLECTION_ID, DATABASE_ID, databases } from "./appwrite";

export const videoService = {
  async getAll(): Promise<VideoLesson[]> {
    const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.orderAsc("topic_id"),
      Query.orderAsc("order_index"),
      Query.limit(1000),
    ]);
    return response.documents as VideoLesson[];
  },

  async getByTopic(topicId: string): Promise<VideoLesson[]> {
    const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.equal("topic_id", topicId),
      Query.orderAsc("order_index"),
    ]);
    return response.documents as VideoLesson[];
  },

  async create(video: Omit<VideoLesson, "$id" | "created_at" | "updated_at">): Promise<VideoLesson> {
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

  async update(id: string, updates: Partial<VideoLesson>): Promise<VideoLesson> {
    const response = await databases.updateDocument(DATABASE_ID, COLLECTION_ID, id, {
      ...updates,
      updated_at: new Date().toISOString(),
    });
    return response as VideoLesson;
  },

  async delete(id: string): Promise<void> {
    await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, id);
  },

  async toggleActive(id: string, isActive: boolean): Promise<VideoLesson> {
    return this.update(id, { is_active: isActive });
  },
};
