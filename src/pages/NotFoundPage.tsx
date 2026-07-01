import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="flex-1 flex items-center justify-center py-28">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404 — Página no encontrada</h1>
        <p className="text-ink-muted mb-6">
          Lo sentimos, la ruta que buscas no existe.
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-utn-blue text-white rounded-lg shadow-sm"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
