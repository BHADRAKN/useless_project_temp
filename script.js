// script.js
// Fun "Fish Health & Age Detector" prototype
// - drag/drop or file input (image/video)
// - fake analysis with heuristics + randomness
// - dark mode + vibrate if "dead"
// - create PDF via jsPDF and open it (simulate download)

const { jsPDF } = window.jspdf; // from CDN

const dropArea = document.getElementById("drop-area");
const fileInput = document.getElementById("fileInput");
const preview = document.getElementById("preview");
const analysisArea = document.getElementById("analysisArea");
const progressBar = document.getElementById("progressBar");
const analysisText = document.getElementById("analysisText");
const resultBox = document.getElementById("resultBox");
const statusTitle = document.getElementById("statusTitle");
const ageText = document.getElementById("ageText");
const causeText = document.getElementById("causeText");
const healthSheet = document.getElementById("healthSheet");
const showPdfBtn = document.getElementById("showPdfBtn");

let currentMedia = null; // { type: 'image'|'video', src: dataURL, fileName }
let lastReport = null;

// helper: keywords to infer cause from filename or dataURL label
const fisherKeywords = ["net","fisher","fishing","rod","hook","boat","fishman","fisherman"];
const birdKeywords = ["kingfisher","bird","wing","beak","king","kff"];
const deadIndicators = ["dead","floating","upside","xeyes","x-eye"]; // optional

const ageLabels = [
  { label:"Newborn", range:[0,0.2] },
  { label:"Baby", range:[0.2,0.4] },
  { label:"Young", range:[0.4,0.6] },
  { label:"Adult", range:[0.6,0.8] },
  { label:"Old", range:[0.8,0.94] },
  { label:"About to Die", range:[0.94,1.0] }
];

const healthPhrases = [
  "Healthy as a sea cucumber 🥒",
  "Too much plankton binge 🍽️",
  "Low morale — wants to travel 🚣",
  "Suffering from fishy gossip 🐠",
  "Loves dramatic fainting spells 😴",
  "Has a secret identity crisis 🐟➡️🐬",
  "Minor scale rash, will be fine!"
];

// Drag & Drop handlers
dropArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropArea.classList.add("dragover");
});
dropArea.addEventListener("dragleave", (e) => {
  e.preventDefault();
  dropArea.classList.remove("dragover");
});
dropArea.addEventListener("drop", (e) => {
  e.preventDefault();
  dropArea.classList.remove("dragover");
  const f = e.dataTransfer.files && e.dataTransfer.files[0];
  if (f) handleFile(f);
});

// File input
fileInput.addEventListener("change", (e) => {
  const f = e.target.files && e.target.files[0];
  if (f) handleFile(f);
});

function handleFile(file){
  const type = file.type;
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
      // try to capture a frame for PDF thumbnail later
      startAnalysis(true);
    } else {
      alert("Unsupported file type. Use image or video.");
    }
  };
  reader.readAsDataURL(file);
}

function showImagePreview(dataURL){
  preview.innerHTML = `<img id="mediaPreview" src="${dataURL}" alt="fish preview">`;
}

function showVideoPreview(dataURL){
  preview.innerHTML = `<video id="mediaPreview" src="${dataURL}" controls muted playsinline></video>`;
}

// Start fake analysis
function startAnalysis(isVideo=false){
  analysisArea.classList.remove("hidden");
  resultBox.classList.add("hidden");
  progressBar.style.width = "0%";
  analysisText.textContent = "Initializing PondVision™...";
  document.body.classList.remove("dark-mode");

  // animated steps
  const steps = [
    { text: "Calibrating gill sensors...", time: 700 },
    { text: "Reading tail flutter frequency...", time: 800 },
    { text: "Checking surrounding ripples...", time: 700 },
    { text: "Searching for nets / birds / humans...", time: 900 },
    { text: "Applying fish psychology heuristics...", time: 700 }
  ];

  let stepIndex = 0;
  let progress = 0;

  function nextStep(){
    if(stepIndex >= steps.length){
      // finish
      progressBar.style.width = "100%";
      analysisText.textContent = "Finalizing analysis...";
      setTimeout(finalizeAnalysis, 700);
      return;
    }
    const step = steps[stepIndex];
    analysisText.textContent = step.text;
    // animate progress with small increments
    const inc = 100 / steps.length;
    animateProgress(progress, progress + inc, step.time);
    progress += inc;
    stepIndex++;
    setTimeout(nextStep, step.time + 80);
  }

  nextStep();
}

// simple progress animation helper
function animateProgress(from, to, duration){
  const start = performance.now();
  function tick(now){
    const t = Math.min(1, (now - start)/duration);
    const val = from + (to - from)*t;
    progressBar.style.width = val + "%";
    if(t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// Finalize - generate fun analysis
async function finalizeAnalysis(){
  // heuristics from filename/dataurl
  const filename = (currentMedia && currentMedia.fileName || "").toLowerCase();
  const dataURL = currentMedia && currentMedia.src || "";
  const rand = Math.random();

  // pick age by weighted randomness (so "About to Die" is rarer)
  const age = ageLabels.find(a => rand >= a.range[0] && rand < a.range[1]).label;

  // detect cause: check filename heuristics - fake auto-detection
  let cause = "Natural causes (sad but peaceful)";
  let detected = false;

  // if filename contains fisher keywords -> fisherman
  for(const kw of fisherKeywords){
    if(filename.includes(kw) || dataURL.includes(kw)){
      cause = "Caught by fisherman 🎣 — now in fisherman's kitchen (RIP)";
      detected = true; break;
    }
  }
  if(!detected){
    for(const kw of birdKeywords){
      if(filename.includes(kw) || dataURL.includes(kw)){
        cause = "Snatched by a kingfisher 🐦 — swift & elegant (RIP)";
        detected = true; break;
      }
    }
  }

  // if age is "About to Die", increase chance of "dead"/"about to die"
  let statusText = "Alive and swimming happily 🐟";
  let isDead = false;
  if(age === "About to Die"){
    // 60% show "will die soon", 40% still alive
    if(Math.random() < 0.6){
      statusText = "About to die — critical condition 💀";
      isDead = true;
    } else {
      statusText = "Weak but alive, needs plankton therapy 😅";
    }
  } else if(age === "Ancient" || age === "Old"){
    if(Math.random() < 0.25){
      statusText = "Passed away peacefully 💀";
      isDead = true;
    } else {
      statusText = "Old but still kicking (slowly) 🐢→🐟";
    }
  } else {
    // younger fish mostly alive
    if(Math.random() < 0.06) { // tiny chance of sudden death
      statusText = "Unexpected death (mystery)! 💀";
      isDead = true;
    }
  }

  // if cause was detected (fisher/bird) and isDead false, we can mark as dead too with higher chance
  if(detected && !isDead){
    if(Math.random() < 0.9){ // fisherman/bird likely means gone
      isDead = true;
      statusText = (cause.includes("fisherman") ? "Caught by fisherman (now part of dinner) 💀" : "Snatched by kingfisher (gone) 💀");
    }
  }

  // assemble health sheet
  const healthLine = healthPhrases[Math.floor(Math.random()*healthPhrases.length)];
  const healthReport = {
    title: "Fish Health Report (Fun)",
    generatedAt: new Date().toLocaleString(),
    ageCategory: age,
    status: statusText,
    cause: isDead ? cause : "No lethal cause detected",
    notes: healthLine
  };

  // display results
  statusTitle.textContent = statusText;
  ageText.textContent = `Age: ${age}`;
  causeText.textContent = `Cause (inferred): ${healthReport.cause}`;
  healthSheet.innerHTML = `<strong>Health Note:</strong> ${healthLine}<br><small>Report generated: ${healthReport.generatedAt}</small>`;

  resultBox.classList.remove("hidden");

  // vibrate & dark mode if "dead"
  if(isDead){
    try { navigator.vibrate && navigator.vibrate([300,100,200]); } catch(e){}
    document.body.classList.add("dark-mode");
  } else {
    document.body.classList.remove("dark-mode");
  }

  lastReport = { ...healthReport, media: currentMedia };

  // change analysis text to done
  analysisText.textContent = "Analysis complete. See results below.";
}

// PDF generation & "fake download" show
showPdfBtn.addEventListener("click", async () => {
  if(!lastReport) return;
  // show a fake downloading bar / animation
  analysisText.textContent = "Preparing PDF report...";
  progressBar.style.width = "0%";
  animateProgress(0, 45, 600);
  await wait(650);
  analysisText.textContent = "Encrypting scales... (joking)";
  animateProgress(45, 85, 800);
  await wait(900);
  analysisText.textContent = "Finalizing file — ready!";
  animateProgress(85, 100, 400);
  await wait(500);

  // create PDF via jsPDF
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  doc.setFontSize(18);
  doc.text(lastReport.title, 40, 60);
  doc.setFontSize(11);
  doc.text(`Generated: ${lastReport.generatedAt}`, 40, 90);
  doc.setFontSize(13);
  doc.text(`Age Category: ${lastReport.ageCategory}`, 40, 130);
  doc.text(`Status: ${lastReport.status}`, 40, 155);
  doc.text(`Cause (inferred): ${lastReport.cause}`, 40, 180);
  doc.text(`Notes: ${lastReport.notes}`, 40, 205);

  // Add thumbnail (image) if image exists or if video captured a frame
  try {
    if(lastReport.media && lastReport.media.type === "image"){
      // add image scaled
      const imgData = lastReport.media.src;
      doc.addImage(imgData, 'JPEG', 40, 240, 200, 120); // may auto-convert
    } else if(lastReport.media && lastReport.media.type === "video"){
      // try to capture a frame from the preview video element (if available)
      const vid = document.querySelector("#mediaPreview");
      // draw to canvas
      const canvas = document.createElement('canvas');
      canvas.width = 320; canvas.height = 180;
      const ctx = canvas.getContext('2d');
      // If video ready, draw current frame
      try {
        ctx.drawImage(vid, 0, 0, canvas.width, canvas.height);
        const thumb = canvas.toDataURL('image/jpeg', 0.8);
        doc.addImage(thumb, 'JPEG', 40, 240, 200, 120);
      } catch(e){
        // fallback: put placeholder text
        doc.text("Video attached (thumbnail not available)", 40, 260);
      }
    }
  } catch(e){
    console.warn("Could not add media to PDF", e);
  }

  // Simulate open instead of download: create blob and open in new tab
  const pdfBlob = doc.output('blob');
  const url = URL.createObjectURL(pdfBlob);
  window.open(url, '_blank');

  // reset analysis text
  analysisText.textContent = "PDF shown in a new tab (simulated download).";
});

// small util: wait
function wait(ms){ return new Promise(r=>setTimeout(r, ms)); }
