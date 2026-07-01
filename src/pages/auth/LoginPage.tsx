import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { auth } from "../../lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import profilesApi, { isMissingProfileError } from "../../lib/profiles";

export default function LoginPage() {
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
      await signInWithEmailAndPassword(auth, email, password);

      try {
        await profilesApi.getMe();
        navigate("/", { replace: true });
      } catch (profileError) {
        if (isMissingProfileError(profileError)) {
          navigate("/profile/create", { replace: true });
          return;
        }

        throw profileError;
      }
    } catch (err: any) {
      setError(err?.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-utn-blue">
          Acceso
        </p>
        <h2 className="text-2xl font-semibold tracking-tight">
          Iniciar sesión
        </h2>
        <p className="text-sm text-ink-muted">
          Entrá para ver, guardar y subir apuntes.
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
          {loading ? "Cargando..." : "Entrar"}
        </button>
      </form>
      <div className="flex flex-col gap-3 pt-2 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-ink-muted">
          ¿No tienes cuenta?{" "}
          <Link to="/auth/register" className="text-utn-blue">
            Regístrate
          </Link>
        </p>
        <Link to="/auth/forgot" className="text-utn-blue">
          ¿Olvidaste tu contraseña?
        </Link>
      </div>
    </div>
  );
}
