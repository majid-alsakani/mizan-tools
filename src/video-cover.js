const YOUTUBE_HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"]);
const TIKTOK_HOSTS = new Set(["tiktok.com", "www.tiktok.com", "m.tiktok.com", "vm.tiktok.com", "vt.tiktok.com"]);

export function parseVideoUrl(input) {
  let url;
  try { url = new URL(String(input || "").trim()); } catch { return { error: "أدخل رابط YouTube أو TikTok صالحًا يبدأ بـ https://" }; }
  if (url.protocol !== "https:") return { error: "استخدم رابط HTTPS فقط." };
  const host = url.hostname.toLowerCase();
  if (YOUTUBE_HOSTS.has(host)) {
    const pathParts = url.pathname.split("/").filter(Boolean);
    const id = host === "youtu.be" ? pathParts[0] : url.searchParams.get("v") || (["shorts", "embed", "live"].includes(pathParts[0]) ? pathParts[1] : null);
    if (!id || !/^[A-Za-z0-9_-]{11}$/.test(id)) return { error: "تعذر استخراج معرّف فيديو YouTube من الرابط." };
    return { platform: "youtube", sourceUrl: url.href, videoId: id };
  }
  if (TIKTOK_HOSTS.has(host)) return { platform: "tiktok", sourceUrl: url.href };
  return { error: "الرابط لا ينتمي إلى YouTube أو TikTok." };
}

export function buildYouTubeThumbnailCandidates(videoId) {
  const base = `https://i.ytimg.com/vi/${encodeURIComponent(videoId)}`;
  return ["maxresdefault.jpg", "sddefault.jpg", "hqdefault.jpg", "mqdefault.jpg"].map((file) => `${base}/${file}`);
}

export function isSafeExternalUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

async function fetchJson(url) {
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`لم تستجب المنصة للطلب (${response.status}).`);
  return response.json();
}

function probeImage(url) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve({ url, width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => resolve(null);
    image.src = url;
  });
}

async function highestYouTubeCover(videoId) {
  for (const candidate of buildYouTubeThumbnailCandidates(videoId)) {
    const image = await probeImage(candidate);
    if (image && Math.max(image.width, image.height) >= 480) return image;
  }
  throw new Error("لم تتوفر صورة مصغرة قابلة للعرض لهذا الفيديو.");
}

export async function resolveVideoCover(input) {
  const parsed = parseVideoUrl(input);
  if (parsed.error) throw new Error(parsed.error);
  if (parsed.platform === "youtube") {
    const [metadata, image] = await Promise.all([
      fetchJson(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(parsed.sourceUrl)}`),
      highestYouTubeCover(parsed.videoId),
    ]);
    return { platform: "YouTube", sourceUrl: parsed.sourceUrl, title: metadata.title || "فيديو YouTube", authorName: metadata.author_name || "قناة YouTube", authorUrl: isSafeExternalUrl(metadata.author_url) ? metadata.author_url : parsed.sourceUrl, imageUrl: image.url, imageWidth: image.width, imageHeight: image.height, canBrowserDownload: true };
  }
  const metadata = await fetchJson(`https://www.tiktok.com/oembed?url=${encodeURIComponent(parsed.sourceUrl)}`);
  if (!isSafeExternalUrl(metadata.thumbnail_url)) throw new Error("لم تُرجع TikTok رابط غلاف صالحًا لهذا المحتوى.");
  return { platform: "TikTok", sourceUrl: parsed.sourceUrl, title: metadata.title || "منشور TikTok", authorName: metadata.author_name || "منشئ TikTok", authorUrl: isSafeExternalUrl(metadata.author_url) ? metadata.author_url : parsed.sourceUrl, imageUrl: metadata.thumbnail_url, imageWidth: metadata.thumbnail_width || null, imageHeight: metadata.thumbnail_height || null, canBrowserDownload: false };
}

export async function downloadCoverForAuthorizedUse(imageUrl, fileName) {
  const response = await fetch(imageUrl);
  if (!response.ok) throw new Error("تعذر جلب ملف الصورة من المصدر.");
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = fileName;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}
