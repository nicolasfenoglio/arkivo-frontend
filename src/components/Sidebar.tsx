import type { Department, Subject } from "../types";

interface SidebarProps {
  departments: Department[];
  subjects: Subject[];
  selectedDepartmentId: number | null;
  selectedSubjectId: number | null;
  onSelectDepartment: (id: number | null) => void;
  onSelectSubject: (id: number | null) => void;
}

export default function Sidebar({
  departments,
  subjects,
  selectedDepartmentId,
  selectedSubjectId,
  onSelectDepartment,
  onSelectSubject,
}: SidebarProps) {
  // Filter subjects by selected department if one is selected
  const filteredSubjects = selectedDepartmentId
    ? subjects.filter((s) => s.departmentid === selectedDepartmentId)
    : subjects;

  return (
    <aside
      id="sidebar"
      className="w-full shrink-0 flex flex-col gap-6 xl:w-72"
      aria-label="Filtros"
    >
      <div className="overflow-hidden rounded-2xl border border-border bg-surface-card shadow-sm">
        <div className="bg-utn-blue px-5 py-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-white">
            Carreras
          </h2>
        </div>
        <ul className="px-3 py-4">
          {departments.map((career) => (
            <li key={career.id}>
              <button
                id={`sidebar-career-${career.name.replace(/\s+/g, "-").toLowerCase()}`}
                onClick={() => {
                  if (selectedDepartmentId === career.id) {
                    onSelectDepartment(null);
                    onSelectSubject(null);
                  } else {
                    onSelectDepartment(career.id);
                    onSelectSubject(null);
                  }
                }}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm transition-all ${
                  selectedDepartmentId === career.id
                    ? "bg-utn-blue/10 text-utn-blue font-semibold shadow-sm"
                    : "text-ink-soft hover:bg-border/50 hover:text-ink"
                }`}
              >
                <span className="text-utn-blue-light font-bold">•</span>
                {career.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Materias */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface-card shadow-sm">
        <div className="bg-utn-blue px-5 py-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-white">
            Materias
          </h2>
        </div>
        <ul className="px-3 py-4">
          {filteredSubjects.map((subject) => (
            <li key={subject.id}>
              <button
                id={`sidebar-subject-${subject.name.replace(/\s+/g, "-").toLowerCase()}`}
                onClick={() =>
                  onSelectSubject(
                    selectedSubjectId === subject.id ? null : subject.id,
                  )
                }
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm transition-all ${
                  selectedSubjectId === subject.id
                    ? "bg-utn-blue/10 text-utn-blue font-semibold shadow-sm"
                    : "text-ink-soft hover:bg-border/50 hover:text-ink"
                }`}
              >
                <span className="text-utn-blue-light font-bold">•</span>
                {subject.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
