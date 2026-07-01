import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../lib/firebase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<null | "idle" | "sent" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("idle");
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
      setStatus("sent");
    } catch (err: any) {
      setError(err?.message || "Error al enviar el correo");
      setStatus("error");
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-utn-blue">
          Acceso
        </p>
        <h2 className="text-2xl font-semibold tracking-tight">
          Recuperar contraseña
        </h2>
        <p className="text-sm text-ink-muted">
          Te enviamos un enlace para restablecer tu acceso.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
          placeholder="Email"
          className="border border-border bg-white px-4 py-3 shadow-sm transition focus:border-utn-blue-light focus:outline-none focus:ring-1 focus:ring-utn-blue-light"
        />
        <button className="mt-2 rounded-full bg-utn-blue px-4 py-3 font-medium text-white transition-colors hover:bg-utn-blue-mid">
          Enviar correo
        </button>
      </form>

      {status === "sent" && (
        <p className="mt-4 text-sm text-green-600">
          Correo enviado. Revisa tu bandeja de entrada.
        </p>
      )}

      {status === "error" && error && (
        <p className="mt-4 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
