import { useState, useRef, useEffect } from "react";
import { useUploadNote } from "../lib/hooks/useUploadNote";
import useCatalogs from "../lib/hooks/useCatalogs";
import { createSubject } from "../lib/departments";
import Spinner from "./Spinner";

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
}

type Step = "files" | "info" | "confirm";
const STEPS: Step[] = ["files", "info", "confirm"];
const STEP_LABELS: Record<Step, string> = {
  files: "Archivos",
  info: "Información",
  confirm: "Confirmación",
};

const LEVELS = [1, 2, 3, 4, 5];

export default function UploadModal({ open, onClose }: UploadModalProps) {
  const { departments, subjects, selectDepartment } = useCatalogs();
  const { upload } = useUploadNote();
  const [step, setStep] = useState<Step>("files");
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [isNewSubject, setIsNewSubject] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [form, setForm] = useState({
    title: "",
    career: "",
    level: -1,
    subject: -1,
    description: "",
    unit: "",
    keywords: "",
  });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open) {
      el.showModal();
    } else {
      el.close();
      setStep("files");
      setFiles([]);
      setForm({
        title: "",
        career: "",
        level: -1,
        subject: -1,
        description: "",
        unit: "",
        keywords: "",
      });
      setIsNewSubject(false);
      setNewSubjectName("");
    }
  }, [open]);

  const currentIdx = STEPS.indexOf(step);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    setFiles(Array.from(e.dataTransfer.files ?? []));
  }

  function advance() {
    const next = STEPS[currentIdx + 1];
    if (next) setStep(next);
  }
  function back() {
    const prev = STEPS[currentIdx - 1];
    if (prev) setStep(prev);
  }

  async function handleSubmit() {
    if (uploading) return;
    if (!files.length) return;

    let subjectId = form.subject;

    if (isNewSubject) {
      if (!newSubjectName.trim()) {
        alert("Por favor ingresá el nombre de la materia nueva.");
        return;
      }
      if (!form.career) {
        alert("Por favor seleccioná una carrera.");
        return;
      }
      if (form.level <= 0) {
        alert("Por favor seleccioná un nivel.");
        return;
      }

      setUploading(true);
      try {
        const newSubj = await createSubject({
          name: newSubjectName.trim(),
          departmentId: Number(form.career),
          level: form.level,
        });
        subjectId = newSubj.id;
      } catch (error) {
        console.error("Error creating subject:", error);
        alert("Hubo un error al crear la materia.");
        return;
      }
    } else {
      if (subjectId === -1) {
        alert("Por favor seleccioná una materia.");
        return;
      }
    }

    await upload(
      {
        name: form.title,
        description: form.description,
        subjectId: subjectId,
        thematicUnit: form.unit,
        keywords: form.keywords,
        visible: true,
      },
      [...files],
    );

    onClose();
    setUploading(false);
  }

  return (
    <dialog
      ref={dialogRef}
      id="upload-modal"
      onClose={onClose}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl rounded-[1.75rem] border border-border bg-surface-card p-0 shadow-[0_28px_80px_-28px_rgba(13,27,42,0.6)] backdrop:bg-black/50 open:animate-[fadeIn_160ms_ease]"
      aria-modal="true"
      aria-labelledby="upload-modal-title"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-5 sm:px-8">
        <h2
          id="upload-modal-title"
          className="text-base font-semibold text-ink"
        >
          Subir apunte
        </h2>
        <button
          id="upload-modal-close"
          onClick={onClose}
          aria-label="Cerrar modal"
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-border/50 hover:text-ink"
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div className="min-h-64 px-6 py-6 sm:px-8 sm:py-7">
        {step === "files" && (
          <div
            className={`flex h-56 cursor-pointer flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed transition-colors ${
              dragOver
                ? "border-utn-blue-light bg-utn-blue/5"
                : "border-border hover:border-utn-blue-light/60 hover:bg-surface"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            id="upload-dropzone"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="w-10 h-10 text-ink-muted"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
              />
            </svg>
            <div className="text-center">
              <p className="text-sm font-medium text-ink">Subir archivo/s</p>
              <p className="text-xs text-ink-muted mt-1">
                Arrastrá archivos o hacé click para seleccionar
              </p>
            </div>
            {files && files.length > 0 && (
              <p className="text-xs font-medium text-utn-blue">
                {files.length} archivo{files.length > 1 ? "s" : ""} seleccionado
                {files.length > 1 ? "s" : ""}
              </p>
            )}
            <label htmlFor="upload-file-input">
              <input
                ref={fileInputRef}
                id="upload-file-input"
                hidden
                multiple
                type="file"
                onChange={(e) => {
                  if (!e.target.files) return;
                  setFiles(Array.from(e.target.files));
                  e.target.value = "";
                }}
              />
            </label>
          </div>
        )}

        {step === "info" && (
          <div className="flex flex-col gap-4" id="upload-info-form">
            <input
              id="info-title"
              type="text"
              placeholder="Título del apunte"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border border-border rounded-xl px-4 py-3 text-sm text-ink placeholder:text-ink-muted transition focus:border-utn-blue-light focus:outline-none focus:ring-1 focus:ring-utn-blue-light"
            />
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <select
                id="info-career"
                value={form.career}
                onChange={(e) => {
                  const val = e.target.value;
                  setForm({ ...form, career: val, subject: -1 });
                  if (val) {
                    selectDepartment(Number(val));
                  }
                }}
                className="border border-border rounded-xl bg-white px-3 py-3 text-sm text-ink transition focus:border-utn-blue-light focus:outline-none focus:ring-1 focus:ring-utn-blue-light"
              >
                <option value="">Carrera</option>
                {departments.map((d) => (
                  <option key={`department-${d.id}`} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              <select
                id="info-level"
                value={form.level}
                onChange={(e) =>
                  setForm({
                    ...form,
                    level: parseInt(e.target.value, 10),
                    subject: -1,
                  })
                }
                className="border border-border rounded-xl bg-white px-3 py-3 text-sm text-ink transition focus:border-utn-blue-light focus:outline-none focus:ring-1 focus:ring-utn-blue-light"
              >
                <option value="">Nivel</option>
                {LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
              {isNewSubject ? (
                <input
                  id="info-new-subject"
                  type="text"
                  placeholder="Nombre de la nueva materia"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  className="border border-border rounded-xl px-3 py-3 text-sm text-ink placeholder:text-ink-muted transition focus:border-utn-blue-light focus:outline-none focus:ring-1 focus:ring-utn-blue-light"
                />
              ) : (
                <select
                  id="info-subject"
                  value={form.subject}
                  onChange={(e) =>
                    setForm({ ...form, subject: parseInt(e.target.value) })
                  }
                  className="border border-border rounded-xl px-3 py-3 text-sm text-ink placeholder:text-ink-muted transition focus:border-utn-blue-light focus:outline-none focus:ring-1 focus:ring-utn-blue-light"
                >
                  <option value={-1}>Materia</option>
                  {(form.level > 0
                    ? subjects.filter((s) => s.level === form.level)
                    : subjects
                  ).map((s) => (
                    <option key={`subject-${s.id}`} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            {/* Toggle to create new subject */}
            <div className="flex items-center gap-2 mt-1">
              <input
                id="toggle-new-subject"
                type="checkbox"
                checked={isNewSubject}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setIsNewSubject(checked);
                  if (!checked) {
                    setNewSubjectName("");
                  } else {
                    setForm((prev) => ({ ...prev, subject: -1 }));
                  }
                }}
                className="rounded border-border text-utn-blue focus:ring-utn-blue-light"
              />
              <label
                htmlFor="toggle-new-subject"
                className="text-xs text-ink-soft select-none cursor-pointer"
              >
                La materia no está en la lista (crear una nueva)
              </label>
            </div>
            <textarea
              id="info-description"
              placeholder="Descripción"
              rows={2}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full resize-none border border-border rounded-xl px-4 py-3 text-sm text-ink placeholder:text-ink-muted transition focus:border-utn-blue-light focus:outline-none focus:ring-1 focus:ring-utn-blue-light"
            />
            <input
              id="info-unit"
              type="text"
              placeholder="Unidad Temática"
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
              className="w-full border border-border rounded-xl px-4 py-3 text-sm text-ink placeholder:text-ink-muted transition focus:border-utn-blue-light focus:outline-none focus:ring-1 focus:ring-utn-blue-light"
            />
            <input
              id="info-keywords"
              type="text"
              placeholder="Palabras clave (separadas por coma)"
              value={form.keywords}
              onChange={(e) => setForm({ ...form, keywords: e.target.value })}
              className="w-full border border-border rounded-xl px-4 py-3 text-sm text-ink placeholder:text-ink-muted transition focus:border-utn-blue-light focus:outline-none focus:ring-1 focus:ring-utn-blue-light"
            />
          </div>
        )}

        {step === "confirm" && (
          <div
            id="upload-confirmation"
            className="flex h-56 flex-col items-center justify-center gap-3 rounded-3xl border border-border text-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="w-10 h-10 text-utn-blue-light"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
            <div>
              <p className="text-sm font-semibold text-ink">
                Resumen de información
              </p>
              {form.title && (
                <p className="text-xs text-ink-soft mt-1">{form.title}</p>
              )}
              {(() => {
                const selectedDeptObj = departments.find(
                  (d) => d.id === Number(form.career),
                );
                const selectedSubjObj = subjects.find(
                  (s) => s.id === form.subject,
                );
                return (
                  selectedDeptObj && (
                    <p className="text-xs text-ink-muted">
                      {selectedDeptObj.name}
                      {isNewSubject
                        ? newSubjectName
                          ? ` · ${newSubjectName}`
                          : ""
                        : selectedSubjObj
                          ? ` · ${selectedSubjObj.name}`
                          : ""}
                    </p>
                  )
                );
              })()}
            </div>
          </div>
        )}
      </div>

      {/* Footer: stepper + actions */}
      <div className="flex items-center justify-between gap-4 border-t border-border bg-surface px-6 py-4 rounded-b-[1.75rem] sm:px-8">
        {/* Step indicators */}
        <div
          className="flex items-center gap-2 text-xs"
          aria-label="Pasos del formulario"
        >
          {STEPS.map((s, i) => (
            <span key={s} className="flex items-center gap-2">
              <span
                className={`flex items-center gap-1 font-medium ${
                  s === step
                    ? "text-utn-blue"
                    : currentIdx > i
                      ? "text-utn-blue-light"
                      : "text-ink-muted"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full inline-block ${
                    s === step
                      ? "bg-utn-blue"
                      : currentIdx > i
                        ? "bg-utn-blue-light"
                        : "bg-border"
                  }`}
                />
                {STEP_LABELS[s]}
              </span>
              {i < STEPS.length - 1 && <span className="text-border">───</span>}
            </span>
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-2">
          {currentIdx > 0 && (
            <button
              id="upload-btn-back"
              onClick={back}
              className="rounded-full border border-border px-4 py-2 text-sm text-ink-soft transition-colors hover:bg-border/40"
              disabled={uploading}
            >
              Atrás
            </button>
          )}
          {currentIdx < STEPS.length - 1 ? (
            <button
              id="upload-btn-next"
              onClick={advance}
              className="rounded-full bg-utn-blue px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-utn-blue-mid"
            >
              Siguiente
            </button>
          ) : (
            <button
              id="upload-btn-confirm"
              onClick={handleSubmit}
              className="rounded-full bg-utn-blue-light px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-utn-sky disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={uploading}
            >
              {uploading ? (
                <div className="flex items-center gap-2">
                  <Spinner />
                  Subiendo...
                </div>
              ) : (
                "Confirmar"
              )}
            </button>
          )}
        </div>
      </div>
    </dialog>
  );
}
