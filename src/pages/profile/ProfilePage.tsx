import { NavLink, useNavigate } from "react-router-dom";
import { useProfile } from "../../context/ProfileContext";
import profilesApi, { type DetailedProfile } from "../../lib/profiles";
import { useEffect, useState } from "react";
import Spinner from "../../components/Spinner";
import { Pencil } from "lucide-react";

type Tab = "notes" | "comments";

export default function ProfilePage() {
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<DetailedProfile | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("notes");
  const { profile } = useProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (!profile) {
      navigate("/");
      return;
    }

    const fetchDetails = async () => {
      setLoading(true);
      try {
        const details = await profilesApi.getDetailsMe();
        setDetails(details);
      } catch (error) {
        console.error("Failed to fetch profile details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [profile, navigate]);

  if (!profile) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">
      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : details ? (
        <>
          {/* Header */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={profile.avatar}
                alt="Avatar"
                className="w-20 h-20 rounded-full object-cover ring-2 ring-slate-200"
              />
              <div>
                <h1 className="text-3xl font-bold text-ink">
                  {details.firstName} {details.lastName}
                </h1>
                <p className="text-slate-500">@{details.username}</p>
                {details.email && (
                  <p className="text-sm text-slate-400">{details.email}</p>
                )}
              </div>
            </div>

            <button
              onClick={() => navigate("/profile/edit")}
              className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-slate-50 cursor-pointer shrink-0"
            >
              <Pencil size={16} />
              Editar perfil
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-slate-200">
            <nav className="flex gap-6">
              <button
                onClick={() => setActiveTab("notes")}
                className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                  activeTab === "notes"
                    ? "border-ink text-ink"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                Apuntes
                <span className="ml-2 text-xs bg-slate-100 text-slate-500 rounded-full px-2 py-0.5">
                  {details.notes.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab("comments")}
                className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                  activeTab === "comments"
                    ? "border-ink text-ink"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                Comentarios
                <span className="ml-2 text-xs bg-slate-100 text-slate-500 rounded-full px-2 py-0.5">
                  {details.comments.length}
                </span>
              </button>
            </nav>
          </div>

          {/* Tab content */}
          <div className="flex flex-col gap-3">
            {activeTab === "notes" ? (
              details.notes.length > 0 ? (
                details.notes.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-lg border border-slate-200 p-4 hover:border-slate-300 transition-colors cursor-pointer"
                    onClick={() => navigate(`/notes/${note.id}`)}
                  >
                    <h3 className="font-semibold text-ink">{note.name}</h3>
                    <p className="text-sm text-slate-500 line-clamp-2 mt-1">
                      {note.description}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-sm py-8 text-center">
                  Todavía no subiste ningun apunte.
                </p>
              )
            ) : details.comments.length > 0 ? (
              details.comments.map((comment) => (
                <div
                  key={comment.id}
                  className="rounded-lg border border-slate-200 p-4 hover:border-slate-300 transition-colors cursor-pointer"
                  onClick={() => navigate(`/notes/${comment.note.id}`)}
                >
                  <p className="text-sm text-ink">{comment.message}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    en{" "}
                    <span className="font-medium">
                      <NavLink to={`/notes/${comment.note.id}`}>
                        {comment.note.name}
                      </NavLink>
                    </span>
                  </p>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-sm py-8 text-center">
                Todavía no dejaste ningún comentario.
              </p>
            )}
          </div>
        </>
      ) : (
        <p className="text-slate-400 text-center py-16">
          No se pudo cargar el perfil.
        </p>
      )}
    </div>
  );
}
