import { createContext, useContext, useEffect, useState } from "react";
import {
  fetchMyProfile,
  createProfile as createProfileApi,
  type Profile,
  type ProfileInput,
  publishAvatar,
} from "../lib/profiles";
import { useAuth } from "./AuthContext";

export interface ProfileContextType {
  profile: Profile | null;
  loading: boolean;
  createProfile: (profile: ProfileInput, avatar?: File) => Promise<void>;
  reload: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const createProfile = async (profile: ProfileInput, avatar?: File) => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      await createProfileApi(profile);
      if (avatar) {
        await publishAvatar(avatar);
      }
      reload();
    } catch (error) {
      console.error("Error creating profile:", error);
      throw error;
    }
  };

  const reload = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const profile = await fetchMyProfile();
      setProfile(profile);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;

    reload();
  }, [user, authLoading]);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        loading,
        createProfile,
        reload,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);

  if (!context) {
    throw new Error("useProfile must be used inside ProfileProvider");
  }

  return context;
}
