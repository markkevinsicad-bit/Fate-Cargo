"use client";

import { createClient } from "@/lib/supabase/client";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB, matches the bucket's server-side limit
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];

export type PhotoUploadResult = { success: true; path: string } | { success: false; error: string };

/**
 * Uploads a single cargo condition photo to the private `cargo-photos`
 * bucket under `{shipmentId}/{recordFolder}/{filename}`. Client-side
 * validation here is a UX nicety only - the bucket's file_size_limit,
 * allowed_mime_types, and storage RLS policies are the real enforcement.
 */
export async function uploadCargoPhoto(
  file: File,
  shipmentId: string,
  recordFolder: string,
): Promise<PhotoUploadResult> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { success: false, error: `Unsupported file type: ${file.type || "unknown"}.` };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: "Photo is too large (max 10MB)." };
  }

  const supabase = createClient();
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${shipmentId}/${recordFolder}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from("cargo-photos").upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    console.error("uploadCargoPhoto error:", error);
    return { success: false, error: "Photo upload failed. Please try again." };
  }

  return { success: true, path };
}
