/**
 * useImageUpload Hook
 * Manages image upload state and operations
 */

import { useState } from "react";
import { StorageService } from "../services/storage.service";
import type { ImageUploadResult } from "../types/flashcard.types";

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<ImageUploadResult | null>(
    null,
  );

  const uploadImage = async (
    fileUri: string,
    filename: string,
    fileSize?: number,
    mimeType?: string,
  ): Promise<ImageUploadResult | null> => {
    try {
      setUploading(true);
      setError(null);

      const result = await StorageService.uploadImage(
        fileUri,
        filename,
        fileSize,
        mimeType,
      );
      setUploadedImage(result);

      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to upload image";
      setError(errorMessage);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (fileId: string): Promise<boolean> => {
    try {
      setError(null);
      await StorageService.deleteImage(fileId);
      setUploadedImage(null);
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete image";
      setError(errorMessage);
      return false;
    }
  };

  const reset = () => {
    setUploadedImage(null);
    setError(null);
    setUploading(false);
  };

  return {
    uploading,
    error,
    uploadedImage,
    uploadImage,
    deleteImage,
    reset,
  };
}
