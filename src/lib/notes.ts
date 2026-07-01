import http, { type QueryParams } from "./http";

export interface NoteInput {
  subjectId: number;
  name: string;
  description: string;
  keywords: string;
  thematicUnit: string;
  visible: boolean;
}

export interface NoteResult {
  id: number;
}

export async function createNote(input: NoteInput) {
  const res = await http.post<NoteResult>("/notes", input);
  return res;
}

export interface FetchNotesParams {
  departmentId?: number;
  subjectId?: number;
  sort?: "rating" | "visits";
}

export interface BackendNote {
  id: number;
  name: string;
  description: string;
  rating: {
    average: number;
    count: number;
  };
  visits: number;
  author: {
    id: number;
    firstName: string;
    lastName: string;
  };
  subject: {
    name: string;
  };
}

export interface BackendNoteComment {
  createdAt: string;
  id: number;
  valoration: number;
  message: string;
  author: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

export interface BackendNoteDetail extends BackendNote {
  thematicUnit?: string;
  keywords?: string;
  visible?: boolean;
  subjectId?: number;
  authorId?: number;
  createdAt?: string;
  updatedAt?: string;
  subject: {
    id?: number;
    name: string;
    level?: number;
    departmentid?: number;
    department?: {
      name: string;
    };
  };
  author: {
    id: number;
    firstName: string;
    lastName: string;
  };
  comments?: BackendNoteComment[];
  resources: {
    id: number;
    fileName: string;
  }[];
}

export async function fetchNotes(
  params?: FetchNotesParams,
): Promise<BackendNote[]> {
  return http.get<BackendNote[]>("/notes", { query: params as QueryParams });
}

export async function fetchNote(id: number): Promise<BackendNoteDetail> {
  return http.get<BackendNoteDetail>(`/notes/${id}`);
}
