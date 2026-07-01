import http, { HttpError } from "./http";

export interface Profile {
  id: number;
  username: string;
  email?: string;
  firstName: string;
  lastName: string;
  avatar: string;
}

export interface ProfileInput {
  username: string;
  firstName: string;
  lastName: string;
}

export async function fetchMyProfile(): Promise<Profile | null> {
  try {
    return await http.get<Profile>("/profiles/@me");
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

export function createProfile(data: ProfileInput) {
  return http.post<{ id: number }>("/profiles", data);
}

export function updateProfile(data: ProfileInput) {
  return http.put<{ id: number }>("/profiles", data);
}

export async function publishAvatar(file: File) {
  const { uploadUrl, key } = await http.post<{
    uploadUrl: string;
    key: string;
  }>(`/profiles/avatar/presign`);

  const upload = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
    },
  });

  if (!upload.ok) throw new Error("Upload failed");

  return await http.post<{ avatar: string }>(`/profiles/avatar`, {
    key,
  });
}

export function isMissingProfileError(error: unknown): boolean {
  return error instanceof HttpError && error.status === 404;
}

export type DetailedProfile = Profile & {
  notes: {
    id: number;
    name: string;
    description: string;
  }[];
  comments: {
    id: number;
    message: string;
    note: {
      id: number;
      name: string;
    };
  }[];
};

const profilesApi = {
  getMe() {
    return http.get<Profile>("/profiles");
  },
  getDetailsMe() {
    return http.get<DetailedProfile>("/profiles/@me");
  },
  getDetailsById(id: number) {
    return http.get<DetailedProfile>(`/profiles/${id}`);
  },
  create(input: ProfileInput) {
    return http.post<{ id: number }>("/profiles", input);
  },
  update(input: ProfileInput) {
    return http.put<{ id: number }>("/profiles", input);
  },
};

export default profilesApi;
