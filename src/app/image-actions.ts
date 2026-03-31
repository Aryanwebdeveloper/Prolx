"use server";

import { v2 as cloudinary } from "cloudinary";
import { createClient } from "../../supabase/server";
import { revalidatePath } from "next/cache";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export type StorageBucket = 
  | "avatars" 
  | "blog-images" 
  | "portfolio-images" 
  | "testimonials" 
  | "team-members";

/**
 * Uploads an image to Cloudinary.
 * @param formData FormData containing the file and bucket name (used as folder)
 * @returns { data: string | null, error: any } The secure URL of the uploaded image or an error
 */
export async function uploadImage(formData: FormData): Promise<{ data: string | null; error: string | null }> {
  const file = formData.get("file") as File;
  const folder = formData.get("bucket") as string || "uploads";

  if (!file) {
    return { data: null, error: "File is required." };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: `prolx/${folder}`,
          resource_type: "auto",
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            resolve({ data: null, error: error.message });
          } else {
            resolve({ data: result?.secure_url || null, error: null });
          }
        }
      ).end(buffer);
    });
  } catch (err: any) {
    console.error("Upload process error:", err);
    return { data: null, error: err.message || "Failed to process image." };
  }
}

/**
 * Deletes an image from Cloudinary given its URL.
 * @param bucket Not strictly needed for Cloudinary delete if we have the URL, but kept for interface compatibility
 * @param url The public URL of the image to delete
 */
export async function deleteImage(bucket: StorageBucket, url: string) {
  if (!url || !url.includes("cloudinary.com")) return { error: null }; // Not a cloudinary image or empty

  try {
    // Extract public_id from URL
    // Format: https://res.cloudinary.com/[cloud_name]/image/upload/v1234567/prolx/avatars/abc123.jpg
    const parts = url.split("/");
    const filenameWithExtension = parts.pop();
    const folder = parts.pop();
    const parentFolder = parts.pop(); // 'prolx'
    
    if (!filenameWithExtension) return { error: "Invalid URL" };
    
    const publicId = `prolx/${folder}/${filenameWithExtension.split(".")[0]}`;

    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result !== "ok" && result.result !== "not_found") {
       return { error: result.result };
    }

    return { error: null };
  } catch (err: any) {
    console.error("Cloudinary delete error:", err);
    return { error: err.message || "Failed to delete image." };
  }
}

/**
 * Specifically updates a user's profile avatar.
 * Handles deleting the old avatar if it exists in Cloudinary.
 */
export async function updateProfileAvatar(userId: string, formData: FormData) {
  const supabase = await createClient();

  // 1. Get current profile to check if there's an old avatar to delete
  const { data: profile } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", userId)
    .single();

  // 2. Upload new image
  const uploadResult = (await uploadImage(formData)) as { data: string | null, error: any };
  if (uploadResult.error) return { error: uploadResult.error };

  const publicUrl = uploadResult.data;

  // 3. Update profile record
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: publicUrl })
    .eq("id", userId);

  if (updateError) return { error: updateError.message };

  // 4. Delete old avatar if it was on Cloudinary
  if (profile?.avatar_url) {
    await deleteImage("avatars", profile.avatar_url);
  }

  revalidatePath("/dashboard");
  return { data: publicUrl, error: null };
}
