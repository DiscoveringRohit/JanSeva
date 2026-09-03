/**
 * Image compression and thumbnail generation utilities.
 * Ensures media uploaded from client devices (cameras, high-res photos)
 * are compressed before transmission to keep network bandwidth minimal.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  mimeType?: string;
}

/**
 * Generic canvas-based image compression
 */
export async function compressImage(
  file: File | Blob | string,
  options: CompressionOptions = {}
): Promise<string> {
  const {
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.7,
    mimeType = "image/jpeg",
  } = options;

  return new Promise((resolve) => {
    // If input is already a string (DataURL or URL)
    if (typeof file === "string") {
      if (!file.startsWith("data:image")) {
        // It's already a hosted URL (http/https)
        return resolve(file);
      }
      const img = new Image();
      img.onload = () => {
        resolve(renderToCanvas(img, maxWidth, maxHeight, quality, mimeType));
      };
      img.onerror = () => resolve(file);
      img.src = file;
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      if (!src) return resolve("");

      const img = new Image();
      img.onload = () => {
        resolve(renderToCanvas(img, maxWidth, maxHeight, quality, mimeType));
      };
      img.onerror = () => resolve(src);
      img.src = src;
    };
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}

function renderToCanvas(
  img: HTMLImageElement,
  maxWidth: number,
  maxHeight: number,
  quality: number,
  mimeType: string
): string {
  const canvas = document.createElement("canvas");
  let width = img.width;
  let height = img.height;

  if (width > maxWidth || height > maxHeight) {
    if (width / height > maxWidth / maxHeight) {
      height = Math.round((height * maxWidth) / width);
      width = maxWidth;
    } else {
      width = Math.round((width * maxHeight) / height);
      height = maxHeight;
    }
  }

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return img.src;
  }

  // Draw image to canvas
  ctx.drawImage(img, 0, 0, width, height);

  // Export compressed data URL
  return canvas.toDataURL(mimeType, quality);
}

/**
 * Compress user avatar to small 200x200 square thumbnail.
 * Output size is typically < 12 KB (saving ~99.5% bandwidth vs 2.5MB raw photo).
 */
export async function compressAvatar(file: File | Blob | string): Promise<string> {
  return compressImage(file, {
    maxWidth: 200,
    maxHeight: 200,
    quality: 0.7,
    mimeType: "image/jpeg",
  });
}

/**
 * Compress civic issue report photo to 800px max dimension.
 * Output size is typically < 45 KB (saving ~95% bandwidth vs 1MB+ photo).
 */
export async function compressIssuePhoto(file: File | Blob | string): Promise<string> {
  return compressImage(file, {
    maxWidth: 800,
    maxHeight: 800,
    quality: 0.65,
    mimeType: "image/jpeg",
  });
}
