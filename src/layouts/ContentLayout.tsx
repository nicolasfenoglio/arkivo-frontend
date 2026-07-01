import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function ContentLayout() {
  return (
    <div className="relative flex flex-col">
      <Navbar />
      <main className="flex-1 w-full max-w-360 mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <Outlet />
      </main>
    </div>
  );
}
