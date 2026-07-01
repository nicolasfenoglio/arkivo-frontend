import { useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import imageCompression from "browser-image-compression";
import { getCroppedImg } from "../lib/crop-image";

const CropperModal = ({
  avatarPreview,
  onClose,
  onCropDone,
}: {
  avatarPreview: string;
  onClose: () => void;
  onCropDone: (file: File, previewUrl: string) => void;
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);

  const onCropComplete = (_croppedArea: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  };

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;

    setProcessing(true);
    try {
      const croppedBlob = await getCroppedImg(
        avatarPreview,
        croppedAreaPixels,
        "image/webp",
      );
      const croppedFile = new File([croppedBlob], "avatar.webp", {
        type: "image/webp",
      });

      const compressedFile = await imageCompression(croppedFile, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
        fileType: "image/webp",
      });

      const finalPreviewUrl = URL.createObjectURL(compressedFile);
      onCropDone(compressedFile, finalPreviewUrl);
      onClose();
    } catch (err) {
      console.error("Error al procesar la imagen", err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="relative h-72 w-full">
        <Cropper
          image={avatarPreview}
          crop={crop}
          zoom={zoom}
          aspect={1}
          cropShape="round"
          showGrid={false}
          onCropChange={setCrop}
          onCropComplete={onCropComplete}
          onZoomChange={setZoom}
        />
      </div>

      <input
        type="range"
        min={1}
        max={3}
        step={0.1}
        value={zoom}
        onChange={(e) => setZoom(Number(e.target.value))}
        className="w-full"
      />

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          disabled={processing}
          className="rounded-full px-4 py-2 text-sm font-medium text-ink-muted hover:bg-gray-100"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={processing || !croppedAreaPixels}
          className="rounded-full bg-utn-blue px-4 py-2 text-sm font-medium text-white hover:bg-utn-blue-mid disabled:opacity-60"
        >
          {processing ? "Procesando..." : "Confirmar"}
        </button>
      </div>
    </div>
  );
};

export default CropperModal;
