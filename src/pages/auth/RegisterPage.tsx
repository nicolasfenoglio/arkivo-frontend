import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { auth } from "../../lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/profile/create", { replace: true });
    } catch (err: any) {
      setError(err?.message || "Error al crear la cuenta");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-utn-blue">
          Registro
        </p>
        <h2 className="text-2xl font-semibold tracking-tight">Crear cuenta</h2>
        <p className="text-sm text-ink-muted">
          Creá tu acceso y después completá tu perfil dentro de la aplicación.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-border bg-white px-4 py-3 shadow-sm transition focus:border-utn-blue-light focus:outline-none focus:ring-1 focus:ring-utn-blue-light"
          placeholder="Email"
          type="email"
          required
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-border bg-white px-4 py-3 shadow-sm transition focus:border-utn-blue-light focus:outline-none focus:ring-1 focus:ring-utn-blue-light"
          placeholder="Contraseña"
          type="password"
          required
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          disabled={loading}
          className="mt-2 rounded-full bg-utn-blue px-4 py-3 font-medium text-white transition-colors hover:bg-utn-blue-mid disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Creando..." : "Crear cuenta"}
        </button>
      </form>
      <p className="text-sm text-ink-muted pt-2">
        ¿Ya tienes cuenta?{" "}
        <Link to="/auth/login" className="text-utn-blue">
          Entrar
        </Link>
      </p>
    </div>
  );
}
