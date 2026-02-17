/**
 * Storage Service
 * Handles image upload/download/deletion for diagram flashcards
 */

import { ID } from "react-native-appwrite";
import type { ImageUploadResult } from "../types/flashcard.types";
import { storage } from "./appwrite";

const BUCKET_ID = "flashcard_images";

export class StorageService {
  /**
   * Upload an image file to Appwrite Storage
   * For React Native, we pass the file object with uri, name, type, and size
   */
  static async uploadImage(
    fileUri: string,
    filename: string,
    fileSize?: number,
    mimeType: string = "image/jpeg",
  ): Promise<ImageUploadResult> {
    try {
      const fileId = ID.unique();

      console.log("Uploading image:", {
        fileUri,
        filename,
        fileSize,
        mimeType,
      });

      // Create file object for React Native Appwrite
      // The file object structure is compatible with react-native-image-picker
      const file = {
        name: filename,
        type: mimeType,
        size: fileSize || 0,
        uri: fileUri,
      };

      // Upload file using the object parameter format
      const uploadedFile = await storage.createFile({
        bucketId: BUCKET_ID,
        fileId: fileId,
        file: file,
      });

      console.log("File uploaded successfully:", uploadedFile.$id);

      // Get file URL
      const fileUrl = this.getImageUrl(uploadedFile.$id);
      console.log("Generated file URL:", fileUrl);

      return {
        fileId: uploadedFile.$id,
        fileUrl,
      };
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  }

  /**
   * Delete an image from storage
   */
  static async deleteImage(fileId: string): Promise<void> {
    try {
      await storage.deleteFile({
        bucketId: BUCKET_ID,
        fileId: fileId,
      });
    } catch (error) {
      console.error("Error deleting image:", error);
      throw error;
    }
  }

  /**
   * Get image URL for viewing
   * Note: getFileViewURL takes individual parameters, not an object
   */
  static getImageUrl(fileId: string): string {
    try {
      // Pass parameters directly, not as an object
      const urlObj = storage.getFileViewURL(BUCKET_ID, fileId);
      console.log("getFileViewURL returned:", urlObj);
      console.log("URL href:", urlObj.href);

      const urlString = urlObj.href || urlObj.toString();
      console.log("Final URL string:", urlString);
      return urlString;
    } catch (error) {
      console.error("Error getting image URL:", error);
      throw error;
    }
  }

  /**
   * Get image download URL
   */
  static getImageDownloadUrl(fileId: string): string {
    try {
      const result = storage.getFileDownloadURL(BUCKET_ID, fileId);
      return result.href || result.toString();
    } catch (error) {
      console.error("Error getting download URL:", error);
      throw error;
    }
  }

  /**
   * Get image preview URL with dimensions
   */
  static getImagePreview(
    fileId: string,
    width: number = 800,
    height: number = 600,
  ): string {
    try {
      const result = storage.getFilePreviewURL(
        BUCKET_ID,
        fileId,
        width,
        height,
      );
      return result.href || result.toString();
    } catch (error) {
      console.error("Error getting image preview:", error);
      throw error;
    }
  }
}
