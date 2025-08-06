import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "../config/firebase";

export class StorageService {
  // Upload image and return URL
  static async uploadImage(
    file: File,
    path: string,
    userId: string
  ): Promise<string> {
    try {
      // Validate file
      if (!file.type.startsWith("image/")) {
        throw new Error("Only image files are allowed");
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("Image size must be less than 5MB");
      }

      // Create unique filename
      const timestamp = Date.now();
      const extension = file.name.split(".").pop();
      const fileName = `${timestamp}_${Math.random()
        .toString(36)
        .substring(7)}.${extension}`;

      // Create storage reference
      const imageRef = ref(
        storage,
        `${path}/${userId}/${fileName}`
      );

      // Upload file
      const snapshot = await uploadBytes(imageRef, file);

      // Get download URL
      const downloadURL = await getDownloadURL(
        snapshot.ref
      );

      return downloadURL;
    } catch (error) {
      console.error("Error uploading image:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to upload image");
    }
  }

  // Upload profile picture
  static async uploadProfilePicture(
    file: File,
    userId: string
  ): Promise<string> {
    return this.uploadImage(
      file,
      "profile-pictures",
      userId
    );
  }

  // Upload chat image
  static async uploadChatImage(
    file: File,
    userId: string
  ): Promise<string> {
    return this.uploadImage(file, "chat-images", userId);
  }

  // Delete image from storage
  static async deleteImage(
    imageUrl: string
  ): Promise<void> {
    try {
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);
    } catch (error) {
      console.error("Error deleting image:", error);
      throw new Error("Failed to delete image");
    }
  }

  // Compress image before upload
  static compressImage(
    file: File,
    maxWidth: number = 800,
    quality: number = 0.8
  ): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxWidth) {
            width = (width * maxWidth) / height;
            height = maxWidth;
          }
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File(
                [blob],
                file.name,
                {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                }
              );
              resolve(compressedFile);
            } else {
              reject(new Error("Failed to compress image"));
            }
          },
          "image/jpeg",
          quality
        );
      };

      img.onerror = () =>
        reject(new Error("Failed to load image"));
      img.src = URL.createObjectURL(file);
    });
  }

  // Get file size in human readable format
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return (
      parseFloat((bytes / Math.pow(k, i)).toFixed(2)) +
      " " +
      sizes[i]
    );
  }

  // Validate image file
  static validateImageFile(file: File): {
    isValid: boolean;
    error?: string;
  } {
    // Check file type
    if (!file.type.startsWith("image/")) {
      return {
        isValid: false,
        error: "Only image files are allowed",
      };
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return {
        isValid: false,
        error: `Image size (${this.formatFileSize(
          file.size
        )}) must be less than 5MB`,
      };
    }

    // Check supported formats
    const supportedFormats = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!supportedFormats.includes(file.type)) {
      return {
        isValid: false,
        error: "Supported formats: JPEG, PNG, GIF, WebP",
      };
    }

    return { isValid: true };
  }

  // Create image preview
  static createImagePreview(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string);
        } else {
          reject(new Error("Failed to create preview"));
        }
      };
      reader.onerror = () =>
        reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  }
}
