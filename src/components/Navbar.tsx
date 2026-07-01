import { NavLink } from "react-router-dom";
import UploadModal from "./UploadModal";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../context/ProfileContext";
import { useModal } from "../lib/modal/modal.provider";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { profile } = useProfile();
  const { showModal } = useModal();

  const showUploadModal = () => {
    if (!profile) {
      return;
    }

    showModal(({ close }) => <UploadModal open={true} onClose={close} />);
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-utn-blue/95 shadow-[0_10px_30px_-18px_rgba(13,27,42,0.7)] backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-360 items-center gap-4 px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <NavLink
            to="/"
            className="flex items-center gap-3 shrink-0"
            id="nav-logo"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/95 shadow-sm ring-1 ring-white/20">
              <span className="text-utn-blue font-black text-base leading-none">
                A
              </span>
            </div>
            <span className="text-white font-bold tracking-widest text-base uppercase">
              Arkivo
            </span>
          </NavLink>

          <nav
            className="hidden flex-1 items-center gap-2 text-sm md:flex"
            id="nav-links"
            aria-label="Navegación principal"
          >
            {[
              { label: "Inicio", to: "/" },
              { label: "Explorar", to: "/explorar" },
              { label: "Contacto", to: "/contacto" },
            ].map(({ label, to }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }: { isActive: boolean }) =>
                  `rounded-full px-4 py-2 text-white/80 transition-all hover:bg-white/10 hover:text-white ${
                    isActive ? "text-white bg-white/15 font-medium" : ""
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Upload button */}
          {profile && (
            <button
              id="btn-upload-apunte"
              onClick={showUploadModal}
              className="flex items-center gap-2 rounded-full bg-utn-blue-light px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-utn-sky shrink-0"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 0 1 .707.293l4 4a1 1 0 0 1-1.414 1.414L11 6.414V13a1 1 0 1 1-2 0V6.414L6.707 8.707A1 1 0 0 1 5.293 7.293l4-4A1 1 0 0 1 10 3Z"
                  clipRule="evenodd"
                />
                <path d="M3 14a1 1 0 0 1 1 1v1h12v-1a1 1 0 1 1 2 0v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-1a1 1 0 0 1 1-1Z" />
              </svg>
              Subir apunte
            </button>
          )}

          {/* Settings icon */}
          {profile && (
            <div className="flex flex-row gap-1">
              <NavLink to="/profile" id="nav-profile">
                <img
                  src={profile.avatar}
                  alt={`Avatar de ${profile.firstName} ${profile.lastName}`}
                  className="w-12 h-12 rounded-full hover:scale-105 transition-transform"
                />
              </NavLink>
              <button
                className="ml-2 rounded-full bg-utn-blue-light px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-utn-sky shrink-0"
                onClick={logout}
                id="nav-logout"
              >
                Cerrar sesión
              </button>
            </div>
          )}
          {!user && (
            <NavLink
              to="/auth/login"
              className="ml-2 rounded-full bg-utn-blue-light px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-utn-sky shrink-0"
              id="nav-login"
            >
              Iniciar sesión
            </NavLink>
          )}
        </div>
      </header>
    </>
  );
}
