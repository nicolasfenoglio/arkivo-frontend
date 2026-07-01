import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { verifyPasswordResetCode, confirmPasswordReset } from "firebase/auth";
import { auth } from "../../lib/firebase";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const oobCode = searchParams.get("oobCode");

  const [email, setEmail] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<
    "idle" | "verifying" | "ready" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!oobCode) {
      setError("Código inválido");
      setStatus("error");
      return;
    }
    setStatus("verifying");
    verifyPasswordResetCode(auth, oobCode)
      .then((email) => {
        setEmail(email);
        setStatus("ready");
      })
      .catch((err) => {
        setError(err?.message || "Código inválido o expirado");
        setStatus("error");
      });
  }, [oobCode]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (!oobCode) {
      setError("Código inválido");
      return;
    }

    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setStatus("success");
      navigate("/auth/login", { replace: true });
    } catch (err: any) {
      setError(err?.message || "Error al cambiar la contraseña");
      setStatus("error");
    }
  }

  if (status === "verifying") {
    return <div className="text-sm text-ink-muted">Verificando enlace...</div>;
  }

  if (status === "error") {
    return <div className="text-sm text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-utn-blue">
          Acceso
        </p>
        <h2 className="text-2xl font-semibold tracking-tight">
          Cambiar contraseña
        </h2>
      </div>
      {email && <p className="text-sm text-ink-muted">Cuenta: {email}</p>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          type="password"
          required
          placeholder="Nueva contraseña"
          className="border border-border bg-white px-4 py-3 shadow-sm transition focus:border-utn-blue-light focus:outline-none focus:ring-1 focus:ring-utn-blue-light"
        />
        <input
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          type="password"
          required
          placeholder="Confirmar contraseña"
          className="border border-border bg-white px-4 py-3 shadow-sm transition focus:border-utn-blue-light focus:outline-none focus:ring-1 focus:ring-utn-blue-light"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="mt-2 rounded-full bg-utn-blue px-4 py-3 font-medium text-white transition-colors hover:bg-utn-blue-mid">
          Cambiar contraseña
        </button>
      </form>
    </div>
  );
}
