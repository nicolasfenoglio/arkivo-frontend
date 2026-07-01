import http from "./http";

export interface PresignResult {
  key: string;
  uploadUrl: string;
}

export async function uploadResource(noteId: number, file: File) {
  const { uploadUrl, key } = await http.post<PresignResult>(
    `/resources/${noteId}/presign`,
  );
  const upload = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
    },
  });

  if (!upload.ok) throw new Error("Upload failed");

  return await http.post<{ avatar: string }>(`/resources/${noteId}`, {
    filename: file.name,
    contentType: file.type,
    key,
  });
}
