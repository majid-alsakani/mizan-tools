export const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
export const SUPPORTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function formatBytes(value) {
  const bytes = Number(value) || 0;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function validateImageFile(file) {
  if (!file) return "اختر صورة للبدء.";
  if (!SUPPORTED_IMAGE_TYPES.has(file.type)) return "الصيغ المدعومة هي JPG وPNG وWebP فقط.";
  if (file.size > MAX_IMAGE_BYTES) return "الحد الأقصى للملف هو 20 MB لحماية ذاكرة المتصفح.";
  return null;
}

export function getTargetDimensions(width, height, maxEdge) {
  const edge = Math.max(320, Number(maxEdge) || 2560);
  if (Math.max(width, height) <= edge) return { width, height, resized: false };
  const scale = edge / Math.max(width, height);
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)), resized: true };
}

export function createDownloadName(fileName, mime) {
  const stem = String(fileName || "image").replace(/\.[^.]+$/, "");
  const extension = mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
  return `${stem}-mizan.${extension}`;
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => { URL.revokeObjectURL(url); resolve(image); };
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error("تعذر قراءة الصورة. جرّب ملفًا سليمًا بصيغة مدعومة.")); };
    image.src = url;
  });
}

export async function compressImage(file, options = {}) {
  const validationError = validateImageFile(file);
  if (validationError) throw new Error(validationError);
  const image = await loadImage(file);
  const dimensions = getTargetDimensions(image.naturalWidth, image.naturalHeight, options.maxEdge);
  const canvas = document.createElement("canvas");
  canvas.width = dimensions.width;
  canvas.height = dimensions.height;
  const context = canvas.getContext("2d", { alpha: options.mime !== "image/jpeg" });
  if (!context) throw new Error("لا يدعم المتصفح مساحة رسم الصور المطلوبة.");
  if (options.mime === "image/jpeg") {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
  }
  context.drawImage(image, 0, 0, dimensions.width, dimensions.height);
  const quality = Math.min(0.95, Math.max(0.4, Number(options.quality) || 0.78));
  const mime = options.mime || "image/webp";
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, mime, quality));
  if (!blob) throw new Error("تعذر إنشاء الصورة المضغوطة. جرّب خفض الأبعاد أو تغيير الصيغة.");
  return { blob, width: dimensions.width, height: dimensions.height, resized: dimensions.resized, mime: blob.type || mime };
}
