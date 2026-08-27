export const PHYSICAL_CSS_RULES = [
  ["margin-left", "margin-inline-start"], ["margin-right", "margin-inline-end"],
  ["padding-left", "padding-inline-start"], ["padding-right", "padding-inline-end"],
  ["border-left", "border-inline-start"], ["border-right", "border-inline-end"],
  ["left", "inset-inline-start"], ["right", "inset-inline-end"],
  ["text-align: left", "text-align: start"], ["text-align: right", "text-align: end"],
];

function lineAt(source, index) {
  return source.slice(0, index).split("\n").length;
}

export function scanRtlSource(source) {
  const issues = [];
  const content = String(source || "");

  PHYSICAL_CSS_RULES.forEach(([physical, logical]) => {
    const pattern = physical.includes(":")
      ? new RegExp(physical.replace(":", "\\s*:\\s*"), "gi")
      : new RegExp(`(?<![-\\w])${physical}\\s*:`, "gi");
    for (const match of content.matchAll(pattern)) {
      issues.push({
        severity: "warning",
        line: lineAt(content, match.index ?? 0),
        title: `خاصية اتجاهية: ${physical}`,
        advice: `استبدلها بـ ${logical} لتتبع اتجاه النص تلقائيًا.`,
      });
    }
  });

  if (/<html\b/i.test(content)) {
    const htmlTag = content.match(/<html\b[^>]*>/i)?.[0] ?? "";
    if (!/\bdir\s*=\s*["']?(rtl|auto)["']?/i.test(htmlTag)) {
      issues.push({ severity: "warning", line: lineAt(content, content.indexOf(htmlTag)), title: "لا توجد سمة dir في عنصر html", advice: 'أضف dir="rtl" لواجهة عربية أو عالج الاتجاه حسب اللغة.' });
    }
    if (!/\blang\s*=/i.test(htmlTag)) {
      issues.push({ severity: "info", line: lineAt(content, content.indexOf(htmlTag)), title: "لا توجد سمة lang في عنصر html", advice: 'أضف lang="ar" أو وسم لغة مناسب لتحسين القراءة التقنية.' });
    }
  }
  if (/flex-direction\s*:\s*row-reverse/i.test(content)) {
    issues.push({ severity: "info", line: lineAt(content, content.search(/flex-direction\s*:\s*row-reverse/i)), title: "استخدام row-reverse يحتاج مراجعة", advice: "لا تستخدمه كحل عام لـ RTL؛ غالبًا يكفي row مع dir الصحيح." });
  }
  return issues.sort((a, b) => a.line - b.line);
}

function flatten(value, path = "", output = new Map()) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    output.set(path || "$", { kind: Array.isArray(value) ? "array" : typeof value, value });
    return output;
  }
  Object.entries(value).forEach(([key, nested]) => flatten(nested, path ? `${path}.${key}` : key, output));
  return output;
}

function placeholders(value) {
  return Array.from(String(value).matchAll(/\{\{\s*[^}]+\s*\}\}|\{\s*\d+\s*\}|%[a-zA-Z]/g), (match) => match[0]).sort();
}

export function compareTranslationJson(arText, enText) {
  let ar;
  let en;
  try { ar = JSON.parse(arText); } catch { return { error: "ملف العربية ليس JSON صالحًا." }; }
  try { en = JSON.parse(enText); } catch { return { error: "ملف الإنجليزية ليس JSON صالحًا." }; }
  const arKeys = flatten(ar);
  const enKeys = flatten(en);
  const missingInArabic = [...enKeys.keys()].filter((key) => !arKeys.has(key));
  const missingInEnglish = [...arKeys.keys()].filter((key) => !enKeys.has(key));
  const typeMismatches = [...enKeys.keys()].flatMap((key) => {
    const arabic = arKeys.get(key);
    const english = enKeys.get(key);
    return arabic && arabic.kind !== english.kind ? [{ key, arabic: arabic.kind, english: english.kind }] : [];
  });
  const placeholderMismatches = [...enKeys.keys()].flatMap((key) => {
    const arabic = arKeys.get(key);
    const english = enKeys.get(key);
    if (!arabic || typeof arabic.value !== "string" || typeof english.value !== "string") return [];
    const arTokens = placeholders(arabic.value).join("|");
    const enTokens = placeholders(english.value).join("|");
    return arTokens === enTokens ? [] : [{ key, arabic: arTokens || "—", english: enTokens || "—" }];
  });
  return { totalArabic: arKeys.size, totalEnglish: enKeys.size, missingInArabic, missingInEnglish, typeMismatches, placeholderMismatches };
}

function normalizeHex(hex) {
  const value = String(hex).trim().replace(/^#/, "");
  if (/^[0-9a-f]{3}$/i.test(value)) return value.split("").map((part) => part + part).join("");
  return /^[0-9a-f]{6}$/i.test(value) ? value : null;
}

function relativeLuminance(hex) {
  const valid = normalizeHex(hex);
  if (!valid) return null;
  const values = [0, 2, 4].map((index) => parseInt(valid.slice(index, index + 2), 16) / 255)
    .map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  return 0.2126 * values[0] + 0.7152 * values[1] + 0.0722 * values[2];
}

export function contrastCheck(foreground, background) {
  const fg = relativeLuminance(foreground);
  const bg = relativeLuminance(background);
  if (fg === null || bg === null) return { error: "استخدم لون HEX بصيغة #RRGGBB أو #RGB." };
  const ratio = (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05);
  return { ratio, normalTextAA: ratio >= 4.5, largeTextAA: ratio >= 3, label: ratio >= 4.5 ? "مناسب كنقطة بداية للنص العادي" : ratio >= 3 ? "مناسب للنص الكبير فقط" : "التباين منخفض؛ غيّر أحد اللونين" };
}
