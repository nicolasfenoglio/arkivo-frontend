import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import NotFoundPage from "./pages/NotFoundPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import CreateProfilePage from "./pages/profile/CreateProfilePage";
import GeneralLayout from "./layouts/GeneralLayout";
import ContentLayout from "./layouts/ContentLayout";
import AuthLayout from "./layouts/AuthLayout";
import RequireAuth from "./components/guards/RequireAuth";
import RequireProfile from "./components/guards/RequireProfile";
import NoteDetailPage from "./pages/notes/NoteDetailPage";
import ProfilePage from "./pages/profile/ProfilePage";
import EditProfilePage from "./pages/profile/EditProfilePage";
import ProfileDetailsPage from "./pages/profile/ProfileDetailsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<GeneralLayout />}>
        {/* Público */}
        <Route element={<ContentLayout />}>
          <Route index element={<HomePage />} />
        </Route>

        {/* Autenticación */}
        <Route path="auth" element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="forgot" element={<ForgotPasswordPage />} />
          <Route path="reset" element={<ResetPasswordPage />} />
        </Route>

        {/* Crear perfil */}
        <Route element={<RequireAuth />}>
          <Route path="profile" element={<AuthLayout />}>
            <Route path="create" element={<CreateProfilePage />} />
          </Route>
        </Route>

        <Route
          element={
            <RequireAuth>
              <RequireProfile />
            </RequireAuth>
          }
        >
          <Route element={<ContentLayout />}>
            <Route path="profile">
              <Route index element={<ProfilePage />} />
              <Route path="edit" element={<EditProfilePage />} />
              <Route path=":id" element={<ProfileDetailsPage />} />
            </Route>
            <Route path="notes">
              <Route index element={<Navigate to="/" />} />
              <Route path=":noteId" element={<NoteDetailPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
