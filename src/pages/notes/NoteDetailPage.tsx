import { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import {
  type BackendNoteComment,
  type BackendNoteDetail,
  fetchNote,
} from "../../lib/notes";
import Spinner from "../../components/Spinner";
import StarRating from "../../components/StarRating";
import { useModal } from "../../lib/modal/modal.provider";
import StarRatingInput from "../../components/StarRatingInput";
import http from "../../lib/http";
import { formatRelativeDate } from "../../lib/date";
import { useProfile } from "../../context/ProfileContext";

export default function NoteDetailPage() {
  const { noteId } = useParams<{ noteId: string }>();
  const [note, setNote] = useState<BackendNoteDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  async function handleDownload(resourceId: number) {
    const { downloadUrl } = await http.get<{ downloadUrl: string }>(
      `/resources/download/${resourceId}`,
    );
    window.open(downloadUrl, "_blank");
  }

  useEffect(() => {
    setLoading(true);
    fetchNote(Number(noteId))
      .then((data) => {
        setNote(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching note:", error);
        setLoading(false);
      });
  }, [noteId]);

  return (
    <div className="h-full w-full grid grid-cols-[7fr_3fr]">
      {loading ? (
        <div className="col-span-2 flex items-center justify-center">
          <Spinner />
        </div>
      ) : note ? (
        <>
          <div className="flex flex-col w-full h-full px-5">
            <div className="flex flex-row justify-between items-center w-full py-2">
              <h1 className="text-2xl font-bold mb-4">{note.name}</h1>
              <span className="flex items-center gap-2 font-semibold">
                Valoración
                <StarRating rating={note.rating?.average || 0} />
              </span>
            </div>
            <div className="flex flex-row justify-between items-center w-full">
              <div className="flex flex-col">
                <h2 className="text-xl font-semibold mb-2">Descripción</h2>
                <p className="mb-4">{note.description}</p>
                <p>
                  <span className="font-semibold">Palabras clave: </span>
                  {note.keywords}
                </p>
              </div>
              <div className="flex flex-col">
                <p>
                  Autor:
                  {note.author ? (
                    <NavLink to={`/profile/${note.author.id}`}>
                      {note.author.firstName} {note.author.lastName}
                    </NavLink>
                  ) : (
                    "Desconocido"
                  )}
                </p>
                <p>Materia: {note.subject?.name || "Desconocida"}</p>
                <p>
                  Carrera: {note.subject.department?.name || "Materias Básicas"}
                </p>
              </div>
            </div>
            <CommentsContainer comments={note.comments} noteId={note.id} />
          </div>
          <div className="flex flex-col w-full px-8">
            <h1 className="text-xl font-semibold mb-5 self-center">
              Contenido
            </h1>
            {note.resources.map((resource) => (
              <div key={resource.id} className="mb-4">
                <h2 className="text-lg font-semibold mb-1">
                  {resource.fileName}
                </h2>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-surface p-2 hover:underline hover:cursor-pointer bg-utn-blue rounded-md"
                  onClick={() => handleDownload(resource.id)}
                >
                  Descargar recurso
                </a>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="col-span-2 flex items-center justify-center">
          <p>Este apunte no existe</p>
        </div>
      )}
    </div>
  );
}

function AddCommentModal({
  onClose,
  noteId,
  setNewComment,
}: {
  onClose: () => void;
  noteId: number;
  setNewComment: (comment: BackendNoteComment | null) => void;
}) {
  const { profile } = useProfile();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      http.post<{ id: number }>(`notes/${noteId}/comment`, {
        valoration: rating,
        message: comment,
      });
      setNewComment({
        valoration: rating,
        message: comment,
        createdAt: new Date().toISOString(),
        id: -1,
        author: { ...profile! },
      });
    } catch (error) {
      setNewComment(null);
    }
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
      <label>Valoracion</label>
      <StarRatingInput name="rating" value={rating} onChange={setRating} />
      <label>Comentario</label>
      <textarea
        className="border border-border bg-white px-4 py-3 shadow-sm transition focus:border-utn-blue-light focus:outline-none focus:ring-1 focus:ring-utn-blue-light"
        placeholder="Escribí tu comentario..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        required
      />
      <button className="mt-2 rounded-full bg-utn-blue px-4 py-3 font-medium text-white transition-colors hover:bg-utn-blue-mid disabled:cursor-not-allowed disabled:opacity-70">
        Enviar comentario
      </button>
    </form>
  );
}

function CommentsContainer({
  comments,
  noteId,
}: {
  comments?: BackendNoteComment[];
  noteId: number;
}) {
  const [newComment, setNewComment] = useState<BackendNoteComment | null>(null);
  const { showModal } = useModal();

  const displayedComments = newComment
    ? [newComment, ...(comments ?? [])]
    : (comments ?? []);

  const handleAddComment = () => {
    showModal(({ close }) => (
      <AddCommentModal
        noteId={Number(noteId)}
        onClose={close}
        setNewComment={setNewComment}
      />
    ));
  };

  return (
    <div className="flex flex-col w-full py-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold mb-2">Comentarios</h2>
        <button
          className="bg-utn-blue text-white px-4 py-2 rounded-md hover:bg-utn-blue-mid"
          onClick={handleAddComment}
        >
          Agregar comentario
        </button>
      </div>
      {displayedComments && displayedComments.length > 0 ? (
        displayedComments.map((comment) => (
          <div key={comment.id} className="py-2 mt-1">
            <span className="flex items-center justify-between gap-2">
              <p className="font-semibold text-xl">
                <NavLink to={`/profile/${comment.author.id}`}>
                  {comment.author.firstName} {comment.author.lastName}
                </NavLink>
                <span className="text-sm font-light text-gray-500 ml-2">
                  {formatRelativeDate(new Date(comment.createdAt))}
                </span>
              </p>
              <StarRating rating={comment.valoration} />
            </span>
            <p>{comment.message}</p>
          </div>
        ))
      ) : (
        <p>No hay comentarios.</p>
      )}
    </div>
  );
}
