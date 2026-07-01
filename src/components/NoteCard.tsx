import { NavLink, useNavigate } from "react-router-dom";
import StarRating from "./StarRating";

export interface Note {
  id: number;
  title: string;
  career: string;
  subject: string;
  authorId: number;
  author: string;
  rating: number;
  downloads: number;
}

export default function NoteCard({ note }: { note: Note }) {
  const navigate = useNavigate();
  return (
    <article
      id={`note-card-${note.id}`}
      className="group flex cursor-pointer items-start justify-between gap-6 rounded-3xl border border-border bg-surface-card px-6 py-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-utn-blue-light hover:shadow-[0_20px_40px_-26px_rgba(0,60,113,0.45)] sm:px-7"
      onClick={() => {
        navigate(`/notes/${note.id}`);
      }}
    >
      <div className="min-w-0 flex flex-col gap-2.5">
        <h3 className="truncate text-base font-semibold text-ink transition-colors group-hover:text-utn-blue">
          {note.title}
        </h3>
        <p className="text-sm text-ink-soft">
          {note.career} · {note.subject}
        </p>
        <p className="text-sm text-ink-muted">
          <NavLink to={`/profile/${note.authorId}`}>{note.author}</NavLink>
        </p>
      </div>

      <div className="shrink-0 pt-1 flex flex-col items-end gap-3">
        <StarRating rating={note.rating} />
        <p className="text-sm text-ink-soft">
          <span className="font-semibold text-ink">{note.downloads}</span>{" "}
          vistas
        </p>
      </div>
    </article>
  );
}
