export interface ImageOperationOptions {
  op: "resize" | "crop" | "convert" | "compress" | "optimize" | "rotate" | "flip" | "metadata";
  width?: number;
  height?: number;
  maintainAspect?: boolean;
  quality?: number;
  format?: "png" | "jpg" | "webp" | "avif";
  rotation?: number;
  flipH?: boolean;
  flipV?: boolean;
  crop?: { x: number; y: number; width: number; height: number };
  removeMetadata?: boolean;
}

export interface ImageOperationResult {
  data: Uint8Array;
  mime: string;
  name: string;
}

function getMimeType(format: string): string {
  switch (format) {
    case "jpg":
      return "image/jpeg";
    case "webp":
      return "image/webp";
    case "avif":
      return "image/avif";
    default:
      return "image/png";
  }
}

function getExtension(format: string): string {
  switch (format) {
    case "jpg":
      return "jpg";
    case "webp":
      return "webp";
    case "avif":
      return "avif";
    default:
      return "png";
  }
}

async function loadImage(file: File): Promise<ImageBitmap> {
  const blob = new Blob([file]);
  return createImageBitmap(blob);
}

export async function imageToBlob(file: File, options: ImageOperationOptions): Promise<{ data: Uint8Array; mime: string; name: string }> {
  const { op, width: optWidth, height: optHeight, maintainAspect = true, quality = 80, format = "webp", rotation = 0, flipH = false, flipV = false, crop, removeMetadata = false } = options;
  
  const img = await loadImage(file);
  let width = img.width;
  let height = img.height;

  // Apply rotation
  if (rotation !== 0) {
    const rad = (rotation * Math.PI) / 180;
    const cos = Math.abs(Math.cos(rad));
    const sin = Math.abs(Math.sin(rad));
    const newWidth = Math.floor(width * cos + height * sin);
    const newHeight = Math.floor(width * sin + height * cos);
    width = newWidth;
    height = newHeight;
  }

  // Apply flip
  // Flip doesn't change dimensions

  // Apply crop
  if (crop) {
    width = crop.width;
    height = crop.height;
  }

  // Apply resize
  if (optWidth || optHeight) {
    if (maintainAspect) {
      const aspectRatio = img.width / img.height;
      if (optWidth && !optHeight) {
        height = Math.round(optWidth / (img.width / img.height));
        width = optWidth;
      } else if (optHeight && !optWidth) {
        width = Math.round(optHeight * (img.width / img.height));
        height = optHeight;
      } else if (optWidth && optHeight) {
        width = optWidth;
        height = optHeight;
      }
    }
  }

  // Create canvas
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  // Fill with white background for JPEG
  if (format === "jpg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
  }

  // Apply transformations
  ctx.save();
  
  // Translate to center for rotation
  ctx.translate(width / 2, height / 2);
  
  if (rotation !== 0) {
    ctx.rotate((rotation * Math.PI) / 180);
  }
  
  if (flipH) {
    ctx.scale(-1, 1);
  }
  if (flipV) {
    ctx.scale(1, -1);
  }
  
  ctx.translate(-width / 2, -height / 2);

  // Draw image
  if (crop) {
    ctx.drawImage(
      img,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      width,
      height
    );
  } else {
    ctx.drawImage(img, 0, 0, width, height);
  }
  
  ctx.restore();

  // Export to blob
  const mimeType = getMimeType(format);
  const qualityVal = (options.quality ?? 80) / 100;
  
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Canvas toBlob failed"));
    }, mimeType, qualityVal);
  });

  const arrayBuffer = await blob.arrayBuffer();
  const data = new Uint8Array(arrayBuffer);
  
  const ext = getExtension(format);
  const baseName = file.name.replace(/\.[^.]+$/, "");
  const name = `${baseName}-${Date.now()}.${getExtension(format)}`;

  return {
    data,
    mime: getMimeType(format),
    name,
  };
}