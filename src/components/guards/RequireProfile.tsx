import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { useProfile } from "../../context/ProfileContext";
import Spinner from "../Spinner";

interface RequireProfileProps {
  children?: React.ReactNode;
}

export default function RequireProfile({ children }: RequireProfileProps) {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();

  if (authLoading || profileLoading) {
    return <Spinner />;
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (!profile) {
    return <Navigate to="/profile/create" replace />;
  }

  return children ?? <Outlet />;
}
