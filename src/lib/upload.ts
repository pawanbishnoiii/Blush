import { supabase } from "@/integrations/supabase/client";

const FIVE_YEARS = 60 * 60 * 24 * 365 * 5;

export type UploadProgress = (pct: number) => void;

function safeName(name: string) {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${name.replace(/[^a-zA-Z0-9.\-_]/g, "-")}`;
}

/**
 * Upload a file to a private storage bucket with real progress reporting
 * (XHR is used because supabase-js does not expose upload progress),
 * then return a long-lived signed URL for display.
 */
export async function uploadFile(
  bucket: string,
  file: File,
  onProgress?: UploadProgress,
  folder?: string,
): Promise<string> {
  const path = folder ? `${folder}/${safeName(file.name)}` : safeName(file.name);
  const { data: session } = await supabase.auth.getSession();
  const token = session.session?.access_token;
  const baseUrl = import.meta.env['VITE_SUPABASE_URL'] as string;
  const apikey = import.meta.env['VITE_SUPABASE_PUBLISHABLE_KEY'] as string;

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${baseUrl}/storage/v1/object/${bucket}/${encodeURI(path)}`);
    xhr.setRequestHeader("apikey", apikey);
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.setRequestHeader("x-upsert", "true");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`Upload failed (${xhr.status})`));
    xhr.onerror = () => reject(new Error("Network error while uploading"));
    const form = new FormData();
    form.append("file", file);
    xhr.send(form);
  });

  onProgress?.(100);
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, FIVE_YEARS);
  if (error || !data) throw error ?? new Error("Could not create image URL");
  return data.signedUrl;
}
