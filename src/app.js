import { assessTextStress, compareTranslationJson, contrastCheck, scanRtlSource } from "./engine.js";
import { compressImage, createDownloadName, formatBytes, validateImageFile } from "./image-compressor.js";

const $ = (selector) => document.querySelector(selector);
const escapeHtml = (value) => String(value).replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char]);
let currentReport = null;
let sourcePreviewUrl = null;
let compressedPreviewUrl = null;

function setActiveTool(tool) {
  document.querySelectorAll("[data-tool-button]").forEach((button) => button.classList.toggle("is-active", button.dataset.toolButton === tool));
  document.querySelectorAll("[data-tool-panel]").forEach((panel) => panel.hidden = panel.dataset.toolPanel !== tool);
  history.replaceState(null, "", `#${tool}`);
}

function renderIssues(issues) {
  if (!issues.length) return '<div class="empty-state"><strong>لا توجد قواعد مطابقة في النص الحالي.</strong><span>هذا لا يثبت اكتمال دعم RTL؛ راجع الواجهة بصريًا وبمحتوى عربي حقيقي.</span></div>';
  return `<div class="result-summary"><b>${issues.length}</b><span>ملاحظة قابلة للمراجعة</span></div><div class="issue-list">${issues.map((issue) => `<article class="issue issue--${issue.severity}"><span class="issue__line">${issue.line}</span><div><strong>${escapeHtml(issue.title)}</strong><p>${escapeHtml(issue.advice)}</p></div><em>${issue.severity === "warning" ? "تحسين" : "مراجعة"}</em></article>`).join("")}</div>`;
}

function renderJsonReport(report) {
  if (report.error) return `<div class="empty-state is-error"><strong>${report.error}</strong></div>`;
  const mismatches = report.missingInArabic.length + report.missingInEnglish.length + report.typeMismatches.length + report.placeholderMismatches.length;
  const list = (items, label) => items.length ? `<details open><summary>${label} <b>${items.length}</b></summary><ul>${items.slice(0, 30).map((item) => `<li><code>${escapeHtml(typeof item === "string" ? item : item.key)}</code></li>`).join("")}${items.length > 30 ? "<li>…</li>" : ""}</ul></details>` : "";
  return `<div class="result-summary"><b>${mismatches}</b><span>فرق يحتاج معالجة</span><small>AR: ${report.totalArabic} مفتاح · EN: ${report.totalEnglish} مفتاح</small></div>${mismatches ? `<div class="json-results">${list(report.missingInArabic, "مفاتيح ناقصة في العربية")}${list(report.missingInEnglish, "مفاتيح ناقصة في الإنجليزية")}${list(report.typeMismatches, "اختلاف في نوع القيمة")}${list(report.placeholderMismatches, "اختلاف في المتغيرات")}</div>` : '<div class="empty-state"><strong>المفاتيح والأنواع والمتغيرات متطابقة.</strong><span>اختبر صياغة الترجمة والسياق والاتجاه بصريًا أيضًا.</span></div>'}`;
}

function renderContrast(report, foreground, background) {
  if (report.error) return `<div class="empty-state is-error"><strong>${report.error}</strong></div>`;
  const status = report.normalTextAA ? "is-good" : report.largeTextAA ? "is-warn" : "is-bad";
  return `<div class="contrast-result ${status}"><div class="contrast-swatch" style="background:${escapeHtml(background)};color:${escapeHtml(foreground)}">Aa</div><div><span>نسبة التباين</span><strong>${report.ratio.toFixed(2)}:1</strong><p>${report.label}</p></div></div><p class="result-caveat">النتيجة مؤشر رياضي للونين ثابتين؛ لا تثبت وحدها توافق صفحة أو منتج كامل مع WCAG.</p>`;
}

function renderStressReport(report) {
  const summary = report.status === "ready" ? "لا توجد إشارة طول بارزة" : "ملاحظات تحتاج مراجعة";
  const findings = report.findings.length ? `<div class="issue-list">${report.findings.map((finding) => `<article class="issue issue--${finding.level === "info" ? "info" : "warning"}"><span class="issue__line">${finding.level === "info" ? "i" : "!"}</span><div><strong>${escapeHtml(finding.title)}</strong><p>${escapeHtml(finding.advice)}</p></div><em>${finding.level === "info" ? "سياق" : "اختبر"}</em></article>`).join("")}</div>` : '<div class="empty-state"><strong>المكوّن يتسع للنصوص الحالية.</strong><span>افحصه أيضًا داخل عرض الهاتف وعند تغيير حجم الخط.</span></div>';
  return `<div class="stress-summary"><div><span>العربية</span><b>${report.arabicLength}</b></div><div><span>الإنجليزية</span><b>${report.englishLength}</b></div><div><span>الحد التجريبي</span><b>${report.capacity}</b></div></div><div class="stress-status ${report.status}">${summary}</div>${findings}`;
}

function renderImageResult(report) {
  const saved = report.originalBytes - report.compressedBytes;
  const percent = report.originalBytes ? Math.max(0, Math.round((saved / report.originalBytes) * 100)) : 0;
  return `<div class="image-result-summary"><div><span>الأصل</span><b>${formatBytes(report.originalBytes)}</b></div><div><span>النتيجة</span><b>${formatBytes(report.compressedBytes)}</b></div><div><span>التوفير</span><b>${percent}%</b></div></div><p class="image-result-note">${report.width} × ${report.height} · ${report.mime.replace("image/", "").toUpperCase()}${report.resized ? " · تم تصغير الأبعاد" : ""}</p>`;
}

function updateContrastPreview() {
  const foreground = $("#foreground").value;
  const background = $("#background").value;
  $("#foregroundText").value = foreground;
  $("#backgroundText").value = background;
  $("#contrast-preview").style.color = foreground;
  $("#contrast-preview").style.background = background;
}

function runRtlScan(event) {
  event.preventDefault();
  currentReport = { type: "rtl", issues: scanRtlSource($("#rtl-source").value) };
  $("#rtl-results").innerHTML = renderIssues(currentReport.issues);
}

function runJsonComparison(event) {
  event.preventDefault();
  currentReport = { type: "translation-json", ...compareTranslationJson($("#ar-json").value, $("#en-json").value) };
  $("#json-results").innerHTML = renderJsonReport(currentReport);
}

function runContrastCheck(event) {
  event.preventDefault();
  const foreground = $("#foregroundText").value;
  const background = $("#backgroundText").value;
  currentReport = { type: "contrast", foreground, background, ...contrastCheck(foreground, background) };
  $("#contrast-results").innerHTML = renderContrast(currentReport, foreground, background);
}

function runStressPreview(event) {
  event.preventDefault();
  const arabic = $("#stress-ar").value;
  const english = $("#stress-en").value;
  const capacity = Number($("#stress-capacity").value) || 34;
  currentReport = { type: "rtl-stress", ...assessTextStress({ arabic, english, capacity }) };
  $("#stress-ar-preview").textContent = arabic || "عنوان عربي للمكوّن";
  $("#stress-en-preview").textContent = english || "Component title";
  $("#stress-results").innerHTML = renderStressReport(currentReport);
}

function showOriginalImage(file) {
  if (sourcePreviewUrl) URL.revokeObjectURL(sourcePreviewUrl);
  sourcePreviewUrl = URL.createObjectURL(file);
  $("#image-original-preview").src = sourcePreviewUrl;
  $("#image-file-name").textContent = file.name;
  $("#image-original-meta").textContent = `${formatBytes(file.size)} · جاهز للضغط محليًا`;
  $("#image-original-card").hidden = false;
  $("#image-empty-preview").hidden = true;
}

async function runImageCompression(event) {
  event.preventDefault();
  const file = $("#image-file").files[0];
  const error = validateImageFile(file);
  if (error) { $("#image-results").innerHTML = `<div class="empty-state is-error"><strong>${escapeHtml(error)}</strong></div>`; return; }
  const button = $("#compress-image-button");
  button.disabled = true;
  button.textContent = "جاري الضغط محليًا…";
  try {
    const result = await compressImage(file, { quality: Number($("#image-quality").value) / 100, maxEdge: Number($("#image-max-edge").value), mime: $("#image-format").value });
    if (compressedPreviewUrl) URL.revokeObjectURL(compressedPreviewUrl);
    compressedPreviewUrl = URL.createObjectURL(result.blob);
    $("#image-compressed-preview").src = compressedPreviewUrl;
    $("#image-compressed-card").hidden = false;
    const download = $("#image-download");
    download.href = compressedPreviewUrl;
    download.download = createDownloadName(file.name, result.mime);
    download.hidden = false;
    currentReport = { type: "image-compression", originalBytes: file.size, compressedBytes: result.blob.size, width: result.width, height: result.height, resized: result.resized, mime: result.mime };
    $("#image-results").innerHTML = renderImageResult(currentReport);
  } catch (compressionError) {
    $("#image-results").innerHTML = `<div class="empty-state is-error"><strong>${escapeHtml(compressionError.message || "تعذر ضغط الصورة.")}</strong></div>`;
  } finally {
    button.disabled = false;
    button.innerHTML = 'ضغط الصورة <span>↙</span>';
  }
}

$("#rtl-form").onsubmit = runRtlScan;
$("#json-form").onsubmit = runJsonComparison;
$("#contrast-form").onsubmit = runContrastCheck;
$("#stress-form").onsubmit = runStressPreview;
$("#image-form").onsubmit = runImageCompression;

$("#image-file").addEventListener("change", () => {
  const file = $("#image-file").files[0];
  const error = validateImageFile(file);
  $("#image-compressed-card").hidden = true;
  $("#image-download").hidden = true;
  if (error) { $("#image-results").innerHTML = `<div class="empty-state is-error"><strong>${escapeHtml(error)}</strong></div>`; return; }
  showOriginalImage(file);
  $("#image-results").innerHTML = '<div class="empty-state"><strong>اضبط الإعدادات ثم اضغط «ضغط الصورة».</strong><span>لا تغادر الصورة جهازك في أي مرحلة.</span></div>';
});

$("#image-quality").addEventListener("input", () => {
  $("#image-quality-value").textContent = $("#image-quality").value;
});

[["#foreground", "#foregroundText"], ["#background", "#backgroundText"]].forEach(([color, text]) => {
  $(color).addEventListener("input", updateContrastPreview);
  $(text).addEventListener("input", () => { const value = $(text).value; if (/^#[0-9a-f]{6}$/i.test(value)) $(color).value = value; updateContrastPreview(); });
});

$("#copy-report").addEventListener("click", async () => {
  if (!currentReport) return;
  await navigator.clipboard.writeText(JSON.stringify(currentReport, null, 2));
  $("#copy-report").textContent = "تم النسخ";
  setTimeout(() => $("#copy-report").textContent = "نسخ التقرير", 1600);
});

document.querySelectorAll("[data-tool-button]").forEach((button) => button.addEventListener("click", () => setActiveTool(button.dataset.toolButton)));
const initialTool = location.hash.replace("#", "");
if (["rtl", "json", "contrast", "stress", "image"].includes(initialTool)) setActiveTool(initialTool);
updateContrastPreview();
