import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import NoteCard, { type Note } from "../components/NoteCard";
import Spinner from "../components/Spinner";
import { fetchAllDepartments, fetchAllSubjects } from "../lib/departments";
import { fetchNotes } from "../lib/notes";
import type { Department, Subject } from "../types";
import { useModal } from "../lib/modal/modal.provider";
import UploadModal from "../components/UploadModal";
import { useProfile } from "../context/ProfileContext";

type SortOption = "rating" | "visits";

export default function HomePage() {
  const [sortBy, setSortBy] = useState<SortOption | null>();
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<
    number | null
  >(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(
    null,
  );

  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [allDepartments, setAllDepartments] = useState<Department[]>([]);
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);

  const { profile } = useProfile();
  const { showModal } = useModal();

  const showUploadModal = () => {
    if (!profile) {
      return;
    }
    showModal(({ close }) => <UploadModal open={true} onClose={close} />);
  };

  useEffect(() => {
    let active = true;
    async function loadCatalogs() {
      try {
        const [depts, subjs] = await Promise.all([
          fetchAllDepartments(),
          fetchAllSubjects(),
        ]);
        if (active) {
          setAllDepartments(depts);
          setAllSubjects(subjs);
        }
      } catch (err) {
        console.error("Failed to load catalogs:", err);
      }
    }
    void loadCatalogs();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    async function getNotes() {
      setLoading(true);
      setError(null);
      try {
        const params = {
          ...(selectedDepartmentId && { departmentId: selectedDepartmentId }),
          ...(selectedSubjectId && { subjectId: selectedSubjectId }),
          ...(sortBy && {
            sort:
              sortBy === "visits" ? ("visits" as const) : ("rating" as const),
          }),
        };
        const backendNotes = await fetchNotes(params);
        if (!active) return;

        const mapped = backendNotes.map((n) => {
          const subject = allSubjects.find((s) => s.name === n.subject?.name);
          const deptId = subject?.departmentid;
          const dept = allDepartments.find((d) => d.id === deptId);

          return {
            id: n.id,
            title: n.name,
            career: dept?.name || "Materias Básicas",
            subject: n.subject?.name || "",
            authorId: n.author?.id || 0,
            author: n.author
              ? `${n.author.firstName} ${n.author.lastName}`
              : "Autor Desconocido",
            rating: n.rating?.average || 0,
            downloads: n.visits || 0,
          };
        });

        setNotes(mapped);
      } catch (err) {
        if (active) {
          console.error("Failed to fetch notes:", err);
          setError("Error al cargar los apuntes.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    getNotes();
    return () => {
      active = false;
    };
  }, [
    selectedDepartmentId,
    selectedSubjectId,
    sortBy,
    allDepartments,
    allSubjects,
  ]);

  return (
    <div className="space-y-8">
      <p className="text-xs text-ink-muted">
        <span className="text-utn-blue font-semibold">Home</span>
      </p>

      <div className="flex flex-col gap-8 xl:flex-row xl:items-start">
        <Sidebar
          departments={allDepartments}
          subjects={allSubjects}
          selectedDepartmentId={selectedDepartmentId}
          selectedSubjectId={selectedSubjectId}
          onSelectDepartment={setSelectedDepartmentId}
          onSelectSubject={setSelectedSubjectId}
        />

        <section className="flex-1 min-w-0" aria-label="Lista de apuntes">
          <div className="mb-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-ink">
                Apuntes destacados
              </h1>
              <p className="text-sm text-ink-muted">
                Filtrá por carrera y materia para encontrar el material más
                útil.
              </p>
            </div>
            <div className="flex items-center gap-3 self-stretch sm:self-auto">
              <span className="text-sm text-ink-muted">Ordenar por:</span>
              <div className="flex overflow-hidden rounded-full border border-border bg-surface-card shadow-sm">
                <button
                  id="sort-by-rating"
                  onClick={() => setSortBy("rating")}
                  className={`px-5 py-2.5 text-sm font-medium transition-colors ${
                    sortBy === "rating"
                      ? "bg-utn-blue text-white"
                      : "text-ink-soft hover:bg-border/40 hover:text-ink"
                  }`}
                >
                  Mejor valorado
                </button>
                <button
                  id="sort-by-visits"
                  onClick={() => setSortBy("visits")}
                  className={`border-l border-border px-5 py-2.5 text-sm font-medium transition-colors ${
                    sortBy === "visits"
                      ? "bg-utn-blue text-white"
                      : "text-ink-soft hover:bg-border/40 hover:text-ink"
                  }`}
                >
                  Más visitados
                </button>
              </div>
            </div>
          </div>

          {/* Note cards */}
          {loading ? (
            <div className="flex justify-center py-24" id="notes-loading">
              <Spinner />
            </div>
          ) : error ? (
            <div
              className="flex flex-col items-center justify-center py-24 text-center"
              id="notes-error"
            >
              <p className="text-sm text-red-500 font-medium">{error}</p>
            </div>
          ) : notes.length > 0 ? (
            <ul className="flex flex-col gap-5" id="notes-list">
              {notes.map((note) => (
                <li key={note.id}>
                  <NoteCard note={note} />
                </li>
              ))}
            </ul>
          ) : (
            <div
              className="flex flex-col items-center justify-center py-24 text-center"
              id="notes-empty"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="w-12 h-12 text-border mb-4"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                />
              </svg>
              <p className="text-sm text-ink-muted flex flex-col">
                No hay apuntes para los filtros seleccionados.
                <button
                  className="mt-2 text-utn-blue hover:text-utn-blue-light hover:underline"
                  onClick={showUploadModal}
                >
                  Subí el primero
                </button>
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
