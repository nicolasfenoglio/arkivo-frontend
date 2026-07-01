import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:px-6 sm:py-12 bg-linear-to-br from-utn-blue/10 via-surface to-white">
      <div className="w-full max-w-md px-6 sm:px-8 py-8 sm:py-10 bg-surface-card/95 border border-border rounded-3xl shadow-[0_24px_60px_-28px_rgba(13,27,42,0.45)] backdrop-blur-sm">
        <Outlet />
      </div>
    </div>
  );
}
