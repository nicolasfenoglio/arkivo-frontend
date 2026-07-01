import type { Area } from "react-easy-crop";

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.src = url;
  });
}

export async function getCroppedImg(
  imageSrc: string,
  cropAreaPixels: Area,
  mimeType = "image/webp",
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("No se pudo obtener el contexto del canvas");

  canvas.width = cropAreaPixels.width;
  canvas.height = cropAreaPixels.height;

  ctx.drawImage(
    image,
    cropAreaPixels.x,
    cropAreaPixels.y,
    cropAreaPixels.width,
    cropAreaPixels.height,
    0,
    0,
    cropAreaPixels.width,
    cropAreaPixels.height,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Error al generar el blob de la imagen"));
          return;
        }
        resolve(blob);
      },
      mimeType,
      0.9,
    );
  });
}
