/**
 * Appwrite Client for Admin Panel
 */

import { Client, Databases } from "node-appwrite";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

export const databases = new Databases(client);
export const DATABASE_ID = "flashcard_db";
export const COLLECTION_ID = "video_lessons";
