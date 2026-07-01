import { Outlet } from "react-router-dom";

export default function GeneralLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-transparent text-ink">
      <Outlet />
    </div>
  );
}
