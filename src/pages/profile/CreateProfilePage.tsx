import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import profilesApi, {
  type ProfileInput,
  publishAvatar,
} from "../../lib/profiles";
import { useAuth } from "../../context/AuthContext";
import { Camera } from "lucide-react";
import { useModal } from "../../lib/modal/modal.provider";
import CropperModal from "../../components/CropperModal";

export default function CreateProfilePage() {
  const { user } = useAuth();
  const { showModal } = useModal();
  const navigate = useNavigate();

  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const tempUrl = URL.createObjectURL(file);

    showModal(({ close }) => (
      <CropperModal
        avatarPreview={tempUrl}
        onClose={() => {
          URL.revokeObjectURL(tempUrl);
          close();
        }}
        onCropDone={(finalFile, finalPreviewUrl) => {
          URL.revokeObjectURL(tempUrl);
          setAvatar(finalFile);
          setAvatarPreview((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return finalPreviewUrl;
          });
        }}
      />
    ));
    e.target.value = "";
  };

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const [form, setForm] = useState<ProfileInput>({
    username: "",
    firstName: "",
    lastName: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!user) {
      navigate("/auth/login", { replace: true });
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await profilesApi.create(form);
      if (avatar) {
        await publishAvatar(avatar);
      }
      navigate("/", { replace: true });
    } catch (err: any) {
      setError(err?.message || "Error al crear el perfil");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-utn-blue">
          Perfil
        </p>
        <h2 className="text-2xl font-semibold tracking-tight">
          Completar perfil
        </h2>
        <p className="text-sm text-ink-muted">
          Necesitamos estos datos para crear tu perfil dentro de la aplicación.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col items-center gap-3">
          <label htmlFor="avatar" className="relative cursor-pointer group">
            <div className="h-28 w-28 overflow-hidden rounded-full border-2 border-border bg-gray-100 shadow-sm transition group-hover:opacity-90">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Foto de perfil"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-gray-400">
                  <Camera size={36} />
                </div>
              )}
            </div>

            <div className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full bg-utn-blue text-white shadow-lg transition group-hover:scale-110">
              <Camera size={16} />
            </div>

            <input
              id="avatar"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </label>

          <p className="text-xs text-gray-500">
            Hacé click para elegir una foto
          </p>
        </div>
        <input
          value={form.username}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, username: e.target.value }))
          }
          className="border border-border bg-white px-4 py-3 shadow-sm transition focus:border-utn-blue-light focus:outline-none focus:ring-1 focus:ring-utn-blue-light"
          placeholder="Username"
          maxLength={32}
          required
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <input
            value={form.firstName}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, firstName: e.target.value }))
            }
            className="border border-border bg-white px-4 py-3 shadow-sm transition focus:border-utn-blue-light focus:outline-none focus:ring-1 focus:ring-utn-blue-light"
            placeholder="Nombre"
            required
          />

          <input
            value={form.lastName}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, lastName: e.target.value }))
            }
            className="border border-border bg-white px-4 py-3 shadow-sm transition focus:border-utn-blue-light focus:outline-none focus:ring-1 focus:ring-utn-blue-light"
            placeholder="Apellido"
            required
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="mt-2 rounded-full bg-utn-blue px-4 py-3 font-medium text-white transition-colors hover:bg-utn-blue-mid disabled:cursor-not-allowed disabled:opacity-70"
        >
          {saving ? "Creando..." : "Crear perfil"}
        </button>
      </form>
    </div>
  );
}
