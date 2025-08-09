// script.js
const { jsPDF } = window.jspdf;

const dropArea = document.getElementById("drop-area");
const fileInput = document.getElementById("fileInput");
const preview = document.getElementById("preview");

const analysisArea = document.getElementById("analysisArea");
const funLoader = document.getElementById("funLoader"); // FIX: reference loader
const progressWrap = document.getElementById("progressWrap");
const progressBar = document.getElementById("progressBar");
const analysisText = document.getElementById("analysisText");
const resultBox = document.getElementById("resultBox");
const statusTitle = document.getElementById("statusTitle");
const ageText = document.getElementById("ageText");
const causeText = document.getElementById("causeText");
const healthSheet = document.getElementById("healthSheet");
const showPdfBtn = document.getElementById("showPdfBtn");

let currentMedia = null;
let lastReport = null;

const fisherKeywords = ["net", "fisher", "fishing", "rod", "hook", "boat", "fishman", "fisherman"];
const birdKeywords = ["kingfisher", "bird", "wing", "beak", "king", "kff"];

const ageLabels = [
  { label: "Newborn", range: [0, 0.2] },
  { label: "Baby", range: [0.2, 0.4] },
  { label: "Young", range: [0.4, 0.6] },
  { label: "Adult", range: [0.6, 0.8] },
  { label: "Old", range: [0.8, 0.94] },
  { label: "About to Die", range: [0.94, 1.0] }
];

const healthPhrases = [
  "Healthy as a sea cucumber",
  "Too much plankton binge",
  "Low morale — wants to travel",
  "Suffering from fishy gossip",
  "Loves dramatic fainting spells",
  "Has a secret identity crisis",
  "Minor scale rash, will be fine"
];

function wait(ms) { return new Promise(r => setTimeout(r, ms)); }
function sanitizeForPDF(s) {
  if (!s && s !== "") return "";
  return String(s).replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "");
}

dropArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropArea.classList.add("dragover");
});
dropArea.addEventListener("dragleave", () => {
  dropArea.classList.remove("dragover");
});
dropArea.addEventListener("drop", (e) => {
  e.preventDefault();
  dropArea.classList.remove("dragover");
  const f = e.dataTransfer.files && e.dataTransfer.files[0];
  if (f) handleFile(f);
});

fileInput.addEventListener("change", (e) => {
  const f = e.target.files && e.target.files[0];
  if (f) handleFile(f);
});

function handleFile(file) {
  const type = file.type || "";
  const reader = new FileReader();
  reader.onload = (ev) => {
    const dataURL = ev.target.result;
    if (type.startsWith("image/")) {
      showImagePreview(dataURL);
      currentMedia = { type: "image", src: dataURL, fileName: file.name || "" };
      startAnalysis();
    } else if (type.startsWith("video/")) {
      showVideoPreview(dataURL);
      currentMedia = { type: "video", src: dataURL, fileName: file.name || "" };
      startAnalysis(true);
    } else {
      alert("Unsupported file type. Please upload an image or video.");
    }
  };
  reader.readAsDataURL(file);
}

function showImagePreview(dataURL) {
  preview.innerHTML = `<img id="mediaPreview" src="${dataURL}" alt="fish preview">`;
}
function showVideoPreview(dataURL) {
  preview.innerHTML = `<video id="mediaPreview" src="${dataURL}" controls muted playsinline></video>`;
}

function startAnalysis(isVideo = false) {
  analysisArea.classList.remove("hidden");
  funLoader.classList.remove("hidden"); // FIX: show loader
  progressWrap.classList.remove("hidden");
  resultBox.classList.add("hidden");
  progressBar.style.width = "0%";
  analysisText.style.display = "block";
  analysisText.textContent = "Initializing PondVision™...";
  document.body.classList.remove("dark-mode");

  const steps = [
    { text: "Calibrating gill sensors...", time: 700 },
    { text: "Reading tail flutter frequency...", time: 800 },
    { text: "Checking surrounding ripples...", time: 700 },
    { text: "Searching for nets / birds / humans...", time: 900 },
    { text: "Applying fish psychology heuristics...", time: 700 }
  ];

  let stepIndex = 0;
  let progress = 0;

  function nextStep() {
    if (stepIndex >= steps.length) {
      progressBar.style.width = "100%";
      analysisText.textContent = "Finalizing analysis...";
      setTimeout(finalizeAnalysis, 700);
      return;
    }
    const step = steps[stepIndex];
    analysisText.textContent = step.text;
    const inc = 100 / steps.length;
    animateProgress(progress, progress + inc, step.time);
    progress += inc;
    stepIndex++;
    setTimeout(nextStep, step.time + 80);
  }

  nextStep();
}

function animateProgress(from, to, duration) {
  const start = performance.now();
  function tick(now) {
    const t = Math.min(1, (now - start) / duration);
    const val = from + (to - from) * t;
    progressBar.style.width = val + "%";
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function finalizeAnalysis() {
  const filename = (currentMedia && currentMedia.fileName || "").toLowerCase().trim();
  const rand = Math.random();

  const ageCategory = ageLabels.find(a => rand >= a.range[0] && rand < a.range[1]).label;
  const exactAge = (Math.random() * 10).toFixed(1);

  let cause = "No lethal cause detected";
  let detected = false;
  if (filename) {
    for (const kw of fisherKeywords) {
      if (filename.includes(kw)) {
        cause = "Caught by fisherman — likely human-related (RIP)";
        detected = true;
        break;
      }
    }
    if (!detected) {
      for (const kw of birdKeywords) {
        if (filename.includes(kw)) {
          cause = "Snatched by a bird (kingfisher) — likely predator-related (RIP)";
          detected = true;
          break;
        }
      }
    }
  }

  let statusText = "Alive and swimming happily";
  let isDead = false;

  if (ageCategory === "About to Die") {
    if (Math.random() < 0.6) {
      statusText = "About to die — critical condition";
      isDead = true;
    } else {
      statusText = "Weak but alive, needs plankton therapy";
    }
  } else if (ageCategory === "Old") {
    if (Math.random() < 0.12) {
      statusText = "Passed away peacefully";
      isDead = true;
    } else {
      statusText = "Old but still swimming slowly";
    }
  } else {
    if (Math.random() < 0.03) {
      statusText = "Unexpected death (mystery)";
      isDead = true;
    }
  }

  if (detected && !isDead) {
    if (Math.random() < 0.7) {
      isDead = true;
      statusText = cause.includes("fisherman") ? "Caught by fisherman (now part of dinner)" : "Snatched by bird (gone)";
    }
  }

  const healthLine = healthPhrases[Math.floor(Math.random() * healthPhrases.length)];

  const healthReport = {
    title: "Fish Health Report (Fun)",
    generatedAt: new Date().toLocaleString(),
    ageCategory,
    exactAge,
    status: statusText,
    cause: isDead ? cause : "No lethal cause detected",
    notes: healthLine
  };

  statusTitle.textContent = healthReport.status;
  ageText.textContent = `Age: ${healthReport.ageCategory} (${healthReport.exactAge} years)`;
  causeText.textContent = `Cause (inferred): ${healthReport.cause}`;
  healthSheet.innerHTML = `<strong>Health Note:</strong> ${healthReport.notes}<br><small>Report generated: ${healthReport.generatedAt}</small>`;

  resultBox.classList.remove("hidden");
  funLoader.classList.add("hidden"); // FIX: hide loader
  progressWrap.classList.add("hidden");
  analysisText.style.display = "none";

  if (isDead) {
    try { navigator.vibrate && navigator.vibrate([300, 100, 200]); } catch (e) {}
    document.body.classList.add("dark-mode");
  } else {
    document.body.classList.remove("dark-mode");
  }

  lastReport = { ...healthReport, media: currentMedia };
}

showPdfBtn.addEventListener("click", async () => {
  if (!lastReport) {
    alert("Please run an analysis first.");
    return;
  }
  analysisArea.classList.remove("hidden");
  progressWrap.classList.remove("hidden");
  progressBar.style.width = "0%";
  analysisText.style.display = "block";
  analysisText.textContent = "Preparing PDF report...";

  animateProgress(0, 40, 500);
  await wait(600);
  analysisText.textContent = "Finalizing certificate...";
  animateProgress(40, 100, 600);
  await wait(650);

  generatePDFReport(
    lastReport.ageCategory,
    lastReport.exactAge,
    lastReport.status,
    lastReport.cause,
    lastReport.notes,
    lastReport.media && lastReport.media.type === "image" ? lastReport.media.src : null
  );

  progressWrap.classList.add("hidden");
  analysisText.style.display = "none";
});

function generatePDFReport(ageCategory, exactAge, status, cause, notes, imageData) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  const title = "Fish Health Certificate (Fun)";
  const generated = sanitizeForPDF(`Generated: ${new Date().toLocaleString()}`);
  const s_age = sanitizeForPDF(`${ageCategory} (${exactAge} years)`);
  const s_status = sanitizeForPDF(status);
  const s_cause = sanitizeForPDF(cause);
  const s_notes = sanitizeForPDF(notes);
  const footer = sanitizeForPDF("Powered by Imagination & Coffee | Certified 100% Fun");

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(title, pageWidth / 2, 40, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(generated, pageWidth / 2, 58, { align: "center" });

  // Box dimensions (centered)
  const boxWidth = 400;
  const boxHeight = 350;
  const boxX = (pageWidth - boxWidth) / 2;
  const boxY = 80;

  doc.setDrawColor(2, 119, 189);
  doc.setLineWidth(0.8);
  doc.rect(boxX, boxY, boxWidth, boxHeight);

  // Text inside box
  let y = boxY + 20;
  const leftMargin = boxX + 20;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Age Category:", leftMargin, y);
  doc.setFont("helvetica", "normal");
  doc.text(s_age, leftMargin + 120, y);

  y += 22;
  doc.setFont("helvetica", "bold");
  doc.text("Status:", leftMargin, y);
  doc.setFont("helvetica", "normal");
  doc.text(s_status, leftMargin + 120, y, { maxWidth: boxWidth - 140 });

  y += 22;
  doc.setFont("helvetica", "bold");
  doc.text("Cause (inferred):", leftMargin, y);
  doc.setFont("helvetica", "normal");
  doc.text(s_cause, leftMargin + 120, y, { maxWidth: boxWidth - 140 });

  y += 22;
  doc.setFont("helvetica", "bold");
  doc.text("Notes:", leftMargin, y);
  doc.setFont("helvetica", "normal");
  doc.text(s_notes, leftMargin + 120, y, { maxWidth: boxWidth - 140 });

  // Image inside the box
  if (imageData) {
    try {
      const imgW = 200;
      const imgH = 120;
      const imgX = boxX + (boxWidth - imgW) / 2;
      const imgY = boxY + boxHeight - imgH - 40;
      doc.addImage(imageData, "JPEG", imgX, imgY, imgW, imgH);
    } catch (err) {
      console.warn("Could not add image to PDF:", err);
    }
  }

  // Signature inside box
  doc.setFont("helvetica", "italic");
  doc.text("Dr. Bubbles, Aquatic Fun Specialist", boxX + 20, boxY + boxHeight - 10);

  // Footer
  doc.setFontSize(9);
  doc.setTextColor(110);
  doc.text(footer, pageWidth / 2, 820, { align: "center" });

  try {
    const pdfBlob = doc.output("blob");
    const url = URL.createObjectURL(pdfBlob);
    window.open(url, "_blank");
  } catch (err) {
    console.error("Failed to create/open PDF:", err);
    alert("Could not generate PDF in this browser.");
  }
}
