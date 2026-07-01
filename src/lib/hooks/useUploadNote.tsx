import { useState } from "react";
import { createNote, type NoteInput } from "../notes";
import { uploadResource } from "../resources";

export function useUploadNote() {
  const [loading, setLoading] = useState(false);
  async function upload(note: NoteInput, files: File[]) {
    setLoading(true);
    try {
      const { id } = await createNote(note);

      await Promise.all(files.map((file) => uploadResource(id, file)));
    } finally {
      setLoading(false);
    }
  }
  return {
    upload,
    loading,
  };
}
