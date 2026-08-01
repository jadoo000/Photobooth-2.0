/* ========================================
   GLOBAL STATE
======================================== */
let selectedLayout = localStorage.getItem("selectedLayout") || "classic";
let selectedPhotoCount = parseInt(localStorage.getItem("selectedPhotoCount")) || 3;
let capturedPhotos = JSON.parse(localStorage.getItem("capturedPhotos")) || [];
let capturedFilters = JSON.parse(localStorage.getItem("capturedFilters")) || [];
let selectedFilter = localStorage.getItem("selectedFilter") || "normal";
let selectedBackground = localStorage.getItem("selectedBackground") || "#ffffff";
let selectedFrame = localStorage.getItem("selectedFrame") || "none";
let customText = localStorage.getItem("customText") || "";
let showDate = localStorage.getItem("showDate") === "true";

let cameraStream = null;
let currentCamera = "user";
let retakeIndex = null;
let isTakingPhoto = false;

/* ========================================
   HELPERS
======================================== */
function setCustomization(key, value) {
    localStorage.setItem(key, value);
    drawCustomizeCanvas();
}

function navigateTo(page) {
    stopCamera?.();
    window.location.href = page;
}

/* ========================================
   NAVIGATION
======================================== */
function backToCapture() { navigateTo("capture.html"); }
function finishCustomization() { navigateTo("result.html"); }
function goBackHome() { navigateTo("index.html"); }
function startPhotoBooth() {
    capturedPhotos = [];
    capturedFilters = [];
    retakeIndex = null;
    selectedFilter = "normal";
    selectedBackground = "#ffffff";
    selectedFrame = "none";
    customText = "";
    showDate = false;

    localStorage.setItem("selectedLayout", selectedLayout);
    localStorage.setItem("selectedPhotoCount", selectedPhotoCount);
    localStorage.setItem("selectedFilter", selectedFilter);

    localStorage.removeItem("capturedPhotos");
    localStorage.removeItem("capturedFilters");
    localStorage.removeItem("selectedBackground");
    localStorage.removeItem("selectedFrame");
    localStorage.removeItem("customText");
    localStorage.removeItem("showDate");

    navigateTo("capture.html");
}

/* ========================================
   CUSTOMIZATION
======================================== */
function selectBackground(background, button) {
    selectedBackground = background;
    setCustomization("selectedBackground", background);
    document.querySelectorAll(".background-button").forEach(b => b.classList.remove("active"));
    button?.classList.add("active");
}

function selectFrame(frame, button) {
    selectedFrame = frame;
    setCustomization("selectedFrame", frame);
    document.querySelectorAll(".frame-button").forEach(b => b.classList.remove("active"));
    button?.classList.add("active");
}

function updateCustomText(text) {
    customText = text;
    setCustomization("customText", text);
}

function toggleDate(checked) {
    showDate = checked;
    setCustomization("showDate", checked);
}

/* ========================================
   INITIALIZE CUSTOMIZE PAGE
======================================== */
function initializeCustomizePage() {
    const canvas = document.getElementById("customizeCanvas");
    if (!canvas) return;

    selectedBackground = localStorage.getItem("selectedBackground") || "#ffffff";
    selectedFrame = localStorage.getItem("selectedFrame") || "none";
    customText = localStorage.getItem("customText") || "";
    showDate = localStorage.getItem("showDate") === "true";

    const textInput = document.getElementById("customText");
    if (textInput) textInput.value = customText;

    const dateCheckbox = document.getElementById("showDate");
    if (dateCheckbox) dateCheckbox.checked = showDate;

    document.querySelectorAll(".background-button").forEach(button =>
        button.classList.toggle("active", button.dataset.background === selectedBackground)
    );

    document.querySelectorAll(".frame-button").forEach(button =>
        button.classList.toggle("active", button.dataset.frame === selectedFrame)
    );

    drawCustomizeCanvas();
}

/* ========================================
   DRAW CUSTOMIZATION PREVIEW
======================================== */
function drawCustomizeCanvas() {
    const canvas = document.getElementById("customizeCanvas");
    if (!canvas) return;

    const photos = JSON.parse(localStorage.getItem("capturedPhotos")) || [];
    const layout = localStorage.getItem("selectedLayout") || "classic";
    const photoCount = parseInt(localStorage.getItem("selectedPhotoCount")) || 3;

    if (photos.length === 0) return;

    const images = [];
    let loaded = 0;

    photos.slice(0, photoCount).forEach((src, index) => {
        const image = new Image();
        image.onload = () => {
            loaded++;
            if (loaded === Math.min(photos.length, photoCount)) {
                drawCustomizeLayout(canvas, images, layout);
            }
        };
        image.src = src;
        images[index] = image;
    });
}

/* ========================================
   DRAW CUSTOMIZE LAYOUT (simplified)
======================================== */
function drawCustomizeLayout(canvas, images, layout) {
    let width, height;
    if (layout === "grid") {
        width = 700; height = 700;
    } else if (layout === "four") {
        width = 600; height = 30 + (360 * 4) + (18 * 3) + 90;
    } else {
        width = 600; height = 30 + (405 * 3) + (20 * 2) + 90;
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    // Background
    ctx.fillStyle = selectedBackground;
    ctx.fillRect(0, 0, width, height);

    // TODO: Add photo drawing logic for each layout (classic, four, grid)
    // This part remains unchanged from your original script
}

/* ========================================
   GLOBAL EXPOSURE
======================================== */
window.backToCapture = backToCapture;
window.finishCustomization = finishCustomization;
window.goBackHome = goBackHome;
window.startPhotoBooth = startPhotoBooth;
window.selectBackground = selectBackground;
window.selectFrame = selectFrame;
window.updateCustomText = updateCustomText;
window.toggleDate = toggleDate;
window.initializeCustomizePage = initializeCustomizePage;
