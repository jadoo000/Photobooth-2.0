/* ========================================
   PHOTO BOOTH DATA
======================================== */

let selectedLayout = localStorage.getItem("selectedLayout") || "classic";
let selectedPhotoCount =
    parseInt(localStorage.getItem("selectedPhotoCount")) || 3;

let capturedPhotos =
    JSON.parse(localStorage.getItem("capturedPhotos")) || [];

let capturedFilters =
    JSON.parse(localStorage.getItem("capturedFilters")) || [];

let cameraStream = null;
let currentCamera = "user";
let retakeIndex = null;
let isTakingPhoto = false;


/* ========================================
   CURRENT FILTER
======================================== */

let selectedFilter =
    localStorage.getItem("selectedFilter") || "normal";


/* ========================================
   LAYOUT INFORMATION
======================================== */

const layoutNames = {
    classic: "Classic 3-Photo Strip",
    four: "Four-Photo Strip",
    grid: "2 × 2 Photo Grid"
};


/* ========================================
   FILTER INFORMATION
======================================== */

const filterNames = {
    normal: "Normal",
    vintage: "Vintage",
    bw: "Black & White",
    sepia: "Sepia",
    cool: "Cool",
    warm: "Warm"
};


/* ========================================
   FILTER CSS VALUES
======================================== */

const filterCSS = {
    normal: "none",
    vintage: "sepia(0.25) contrast(1.05) saturate(0.85)",
    bw: "grayscale(1)",
    sepia: "sepia(0.75) contrast(1.05)",
    cool: "saturate(0.85) hue-rotate(15deg) brightness(1.05)",
    warm: "saturate(1.3) sepia(0.15) brightness(1.05)"
};


/* ========================================
   SMALL HELPERS
======================================== */

// Safer getter that uses querySelector to tolerate duplicate/malformed HTML
function getEl(id) {
    return document.querySelector(`#${id}`);
}

// Helper to add listener to all buttons that match a selector
function addClick(selector, handler) {
    document.querySelectorAll(selector).forEach(el => {
        el.addEventListener('click', handler);
    });
}


/* ========================================
   SELECT LAYOUT
======================================== */

function selectLayout(button) {
    const options = document.querySelectorAll(".layout-option");

    options.forEach(option => {
        option.classList.remove("selected");
    });

    button.classList.add("selected");

    selectedLayout = button.dataset.layout;
    selectedPhotoCount = parseInt(button.dataset.photos);

    localStorage.setItem("selectedLayout", selectedLayout);
    localStorage.setItem("selectedPhotoCount", selectedPhotoCount);
}


/* ========================================
   START PHOTO BOOTH
======================================== */

function startPhotoBooth() {
    capturedPhotos = [];
    capturedFilters = [];
    retakeIndex = null;
    selectedFilter = "normal";

    localStorage.setItem("selectedLayout", selectedLayout);
    localStorage.setItem("selectedPhotoCount", selectedPhotoCount);
    localStorage.setItem("selectedFilter", selectedFilter);

    localStorage.removeItem("capturedPhotos");
    localStorage.removeItem("capturedFilters");

    window.location.href = "capture.html";
}


/* ========================================
   BACK HOME
======================================== */

function goBackHome() {
    stopCamera();

    window.location.href = "index.html";
}


/* ========================================
   SELECT FILTER
======================================== */

function selectFilter(filter) {
    selectedFilter = filter;

    localStorage.setItem("selectedFilter", selectedFilter);

    const buttons = document.querySelectorAll(".filter-button");

    buttons.forEach(button => {
        button.classList.remove("active");
    });

    const selectedButton = document.querySelector(
        `[data-filter="${filter}"]`
    );

    if (selectedButton) {
        selectedButton.classList.add("active");
    }

    applyCameraFilter();
}


/* ========================================
   APPLY CAMERA FILTER
======================================== */

function applyCameraFilter() {
    const video = getEl("cameraVideo");

    if (!video) {
        return;
    }

    video.style.filter = filterCSS[selectedFilter] || "none";
}


/* ========================================
   START CAMERA
======================================== */

async function startCamera() {
    try {
        stopCamera();

        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: currentCamera,
                width: {
                    ideal: 1280
                },
                height: {
                    ideal: 720
                }
            },
            audio: false
        });

        const video = getEl("cameraVideo");
        const placeholder = getEl("cameraPlaceholder");
        const captureButton = getEl("captureButton");

        if (!video) {
            return;
        }

        video.srcObject = cameraStream;
        video.style.display = "block";

        if (placeholder) {
            placeholder.style.display = "none";
        }

        if (captureButton) {
            captureButton.disabled = false;
        }

        /* Keep selfie preview mirrored. */

        if (currentCamera === "environment") {
            video.classList.add("back-camera");
        } else {
            video.classList.remove("back-camera");
        }

        /* Re-apply selected filter. */

        applyCameraFilter();

        updateCounter();

    } catch (error) {
        console.error("Camera error:", error);

        alert(
            "Camera access was blocked. Please allow camera permissions and try again."
        );
    }
}


/* ========================================
   STOP CAMERA
======================================== */

function stopCamera() {
    if (!cameraStream) {
        return;
    }

    cameraStream
        .getTracks()
        .forEach(track => {
            track.stop();
        });

    cameraStream = null;
}


/* ========================================
   SWITCH CAMERA
======================================== */

async function switchCamera() {
    if (isTakingPhoto) {
        return;
    }

    currentCamera =
        currentCamera === "user"
            ? "environment"
            : "user";

    await startCamera();
}


/* ========================================
   COUNTER
======================================== */

function updateCounter() {
    const counter = getEl("photoCounter");

    if (!counter) {
        return;
    }

    if (retakeIndex !== null) {
        counter.textContent =
            `Retaking photo ${retakeIndex + 1}`;

        return;
    }

    if (capturedPhotos.length >= selectedPhotoCount) {
        counter.textContent =
            "All photos captured!";

        return;
    }

    counter.textContent =
        `Photo ${capturedPhotos.length + 1} of ${selectedPhotoCount}`;
}


/* ========================================
   CAPTURE PHOTO
======================================== */

async function capturePhoto() {
    if (isTakingPhoto) {
        return;
    }

    const video = getEl("cameraVideo");

    if (
        !cameraStream ||
        !video ||
        video.style.display === "none"
    ) {
        alert("Please open the camera first.");

        return;
    }

    if (
        retakeIndex === null &&
        capturedPhotos.length >= selectedPhotoCount
    ) {
        return;
    }

    isTakingPhoto = true;

    const targetIndex = retakeIndex;

    retakeIndex = null;

    updateCounter();


    /* ========================================
       COUNTDOWN
    ======================================== */

    await runCountdown();


    /* ========================================
       FLASH
    ======================================== */

    triggerFlash();


    /* ========================================
       SHUTTER SOUND
    ======================================== */

    playShutterSound();

    await wait(150);


    /* ========================================
       CREATE IMAGE
    ======================================== */

    const canvas =
        document.createElement("canvas");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context =
        canvas.getContext("2d");


    /*
       The camera preview may be mirrored using CSS.
       The actual saved photo is NOT mirrored.
    */

    context.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
    );


    /* ========================================
       APPLY FILTER TO PHOTO
    ======================================== */

    applyFilterToCanvas(
        context,
        canvas.width,
        canvas.height,
        selectedFilter
    );


    /* ========================================
       CONVERT TO IMAGE
    ======================================== */

    const photo =
        canvas.toDataURL(
            "image/jpeg",
            0.92
        );


    /* ========================================
       SAVE PHOTO
    ======================================== */

    if (targetIndex !== null) {
        capturedPhotos[targetIndex] = photo;
        capturedFilters[targetIndex] =
            selectedFilter;
    } else {
        capturedPhotos.push(photo);
        capturedFilters.push(selectedFilter);
    }


    /* ========================================
       SAVE TO LOCAL STORAGE
    ======================================== */

    localStorage.setItem(
        "capturedPhotos",
        JSON.stringify(capturedPhotos)
    );

    localStorage.setItem(
        "capturedFilters",
        JSON.stringify(capturedFilters)
    );


    /* ========================================
       UPDATE PREVIEW
    ======================================== */

    updatePreview();
    updateCounter();

    isTakingPhoto = false;


    /* ========================================
       ENABLE FINISH BUTTON
    ======================================== */

    if (
        capturedPhotos.length >= selectedPhotoCount
    ) {
        const finishButton =
            getEl("finishButton");

        if (finishButton) {
            finishButton.disabled = false;
        }
    }
}


/* ========================================
   APPLY FILTER TO CANVAS
======================================== */

function applyFilterToCanvas(
    context,
    width,
    height,
    filter
) {
    if (filter === "normal") {
        return;
    }


    /* ========================================
       READ ORIGINAL IMAGE PIXELS
    ======================================== */

    const imageData =
        context.getImageData(
            0,
            0,
            width,
            height
        );

    const data = imageData.data;


    for (
        let i = 0;
        i < data.length;
        i += 4
    ) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];


        /* ========================================
           BLACK & WHITE
        ======================================== */

        if (filter === "bw") {
            const gray =
                0.299 * r +
                0.587 * g +
                0.114 * b;

            r = gray;
            g = gray;
            b = gray;
        }


        /* ========================================
           SEPIA
        ======================================== */

        else if (filter === "sepia") {
            const newR =
                0.393 * r +
                0.769 * g +
                0.189 * b;

            const newG =
                0.349 * r +
                0.686 * g +
                0.168 * b;

            const newB =
                0.272 * r +
                0.534 * g +
                0.131 * b;

            r = newR;
            g = newG;
            b = newB;
        }


        /* ========================================
           VINTAGE
        ======================================== */

        else if (filter === "vintage") {
            r = r * 1.08 + 10;
            g = g * 0.95 + 5;
            b = b * 0.82;

            r = Math.min(255, r);
            g = Math.min(255, g);
            b = Math.min(255, b);
        }


        /* ========================================
           COOL
        ======================================== */

        else if (filter === "cool") {
            r = r * 0.88;
            g = g * 1.02;
            b = b * 1.15;
        }


        /* ========================================
           WARM
        ======================================== */

        else if (filter === "warm") {
            r = r * 1.12;
            g = g * 1.03;
            b = b * 0.88;
        }


        /* ========================================
           CLAMP VALUES
        ======================================== */

        data[i] =
            Math.max(
                0,
                Math.min(255, r)
            );

        data[i + 1] =
            Math.max(
                0,
                Math.min(255, g)
            );

        data[i + 2] =
            Math.max(
                0,
                Math.min(255, b)
            );
    }


    /* ========================================
       PUT MODIFIED PIXELS BACK
    ======================================== */

    context.putImageData(
        imageData,
        0,
        0
    );
}


/* ========================================
   COUNTDOWN
======================================== */

function runCountdown() {
    return new Promise(resolve => {
        const countdown =
            getEl("countdown");

        if (!countdown) {
            resolve();

            return;
        }

        let number = 3;

        countdown.textContent = number;


        const timer = setInterval(() => {
            number--;

            if (number <= 0) {
                clearInterval(timer);

                countdown.textContent = "📸";

                setTimeout(() => {
                    countdown.textContent = "";

                    resolve();
                }, 350);

                return;
            }

            countdown.textContent = number;

        }, 1000);
    });
}


/* ========================================
   FLASH
======================================== */

function triggerFlash() {
    const flash =
        getEl("cameraFlash");

    if (!flash) {
        return;
    }

    flash.classList.remove("active");

    void flash.offsetWidth;

    flash.classList.add("active");
}


/* ========================================
   SHUTTER SOUND
======================================== */

function playShutterSound() {
    try {
        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;

        const audioContext =
            new AudioContext();

        const oscillator =
            audioContext.createOscillator();

        const gain =
            audioContext.createGain();


        oscillator.type = "square";

        oscillator.frequency.setValueAtTime(
            900,
            audioContext.currentTime
        );

        oscillator.frequency.exponentialRampToValueAtTime(
            150,
            audioContext.currentTime + 0.12
        );


        gain.gain.setValueAtTime(
            0.3,
            audioContext.currentTime
        );

        gain.gain.exponentialRampToValueAtTime(
            0.01,
            audioContext.currentTime + 0.12
        );


        oscillator.connect(gain);

        gain.connect(
            audioContext.destination
        );


        oscillator.start();

        oscillator.stop(
            audioContext.currentTime + 0.12
        );

    } catch (error) {
        console.log(
            "Shutter sound unavailable."
        );
    }
}


/* ========================================
   WAIT
======================================== */

function wait(milliseconds) {
    return new Promise(resolve => {
        setTimeout(
            resolve,
            milliseconds
        );
    });
}


/* ========================================
   UPDATE LIVE PREVIEW
======================================== */

function updatePreview() {
    const preview =
        getEl("photoPreview");

    if (!preview) {
        return;
    }

    preview.innerHTML = "";


    /* ========================================
       CREATE SELECTED LAYOUT
    ======================================== */

    const strip =
        document.createElement("div");

    strip.className =
        "preview-strip";


    /* ========================================
       GRID LAYOUT
    ======================================== */

    if (selectedLayout === "grid") {
        strip.classList.add(
            "preview-grid"
        );
    }


    /* ========================================
       CREATE PHOTO SLOTS
    ======================================== */

    for (
        let i = 0;
        i < selectedPhotoCount;
        i++
    ) {
        const slot =
            document.createElement("div");

        slot.className =
            "preview-slot";


        /* ========================================
           PHOTO EXISTS
        ======================================== */

        if (capturedPhotos[i]) {
            const image =
                document.createElement("img");

            image.src =
                capturedPhotos[i];

            image.alt =
                `Photo ${i + 1}`;

            slot.appendChild(image);


            /* ========================================
               SHOW FILTER NAME
            ======================================== */

            const filterBadge =
                document.createElement("span");

            filterBadge.className =
                "filter-badge";

            filterBadge.textContent =
                filterNames[
                    capturedFilters[i] ||
                    "normal"
                ];

            slot.appendChild(
                filterBadge
            );


            /* ========================================
               RETAKE BUTTON
            ======================================== */

            const retake =
                document.createElement("button");

            retake.className =
                "retake-button";

            retake.textContent =
                "RETAKE";

            retake.onclick = () => {
                retakePhoto(i);
            };

            slot.appendChild(
                retake
            );

        } else {

            /* ========================================
               EMPTY PHOTO SLOT
            ======================================== */

            slot.classList.add(
                "empty"
            );

            slot.textContent =
                `PHOTO ${i + 1}`;
        }


        strip.appendChild(slot);
    }


    /* ========================================
       LABEL
    ======================================== */

    const label =
        document.createElement("div");

    label.className =
        "preview-label";

    label.textContent =
        "PHOTO BOOTH";

    strip.appendChild(label);


    /* ========================================
       ADD TO PREVIEW
    ======================================== */

    preview.appendChild(strip);
}


/* ========================================
   RETAKE INDIVIDUAL PHOTO
======================================== */

function retakePhoto(index) {
    if (isTakingPhoto) {
        return;
    }

    retakeIndex = index;


    /* ========================================
       RESTORE FILTER PREVIOUSLY USED
    ======================================== */

    selectedFilter =
        capturedFilters[index] ||
        "normal";

    localStorage.setItem(
        "selectedFilter",
        selectedFilter
    );


    /* ========================================
       UPDATE FILTER BUTTONS
    ======================================== */

    const buttons =
        document.querySelectorAll(
            ".filter-button"
        );

    buttons.forEach(button => {
        button.classList.remove(
            "active"
        );
    });


    const activeButton =
        document.querySelector(
            `[data-filter="${selectedFilter}"]`
        );

    if (activeButton) {
        activeButton.classList.add(
            "active"
        );
    }


    /* ========================================
       APPLY CAMERA FILTER
    ======================================== */

    applyCameraFilter();

    updateCounter();


    /* ========================================
       SCROLL TO CAMERA
    ======================================== */

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* ========================================
   FINISH
======================================== */

function finishPhotos() {
    if (
        capturedPhotos.length <
        selectedPhotoCount
    ) {
        return;
    }


    localStorage.setItem(
        "capturedPhotos",
        JSON.stringify(capturedPhotos)
    );

    localStorage.setItem(
        "capturedFilters",
        JSON.stringify(capturedFilters)
    );

    localStorage.setItem(
        "selectedLayout",
        selectedLayout
    );

    localStorage.setItem(
        "selectedPhotoCount",
        selectedPhotoCount
    );


    stopCamera();

    window.location.href =
        "result.html";
}


/* ========================================
   RESULT LAYOUT ENGINE
======================================== */

function createFinalPhoto() {
    const canvas =
        getEl(
            "finalCanvas"
        );

    if (!canvas) {
        return;
    }


    /* ========================================
       LOAD SAVED DATA
    ======================================== */

    capturedPhotos =
        JSON.parse(
            localStorage.getItem(
                "capturedPhotos"
            )
        ) || [];

    capturedFilters =
        JSON.parse(
            localStorage.getItem(
                "capturedFilters"
            )
        ) || [];

    selectedLayout =
        localStorage.getItem(
            "selectedLayout"
        ) || "classic";

    selectedPhotoCount =
        parseInt(
            localStorage.getItem(
                "selectedPhotoCount"
            )
        ) || 3;


    /* ========================================
       UPDATE LAYOUT NAME
    ======================================== */

    const layoutName =
        getEl(
            "resultLayoutName"
        );

    if (layoutName) {
        layoutName.textContent =
            layoutNames[
                selectedLayout
            ] || "Photo Booth";
    }


    /* ========================================
       LOAD IMAGES
    ======================================== */

    const images = [];

    let loaded = 0;


    capturedPhotos
        .slice(
            0,
            selectedPhotoCount
        )
        .forEach(
            (src, index) => {
                const image =
                    new Image();

                image.onload = () => {
                    loaded++;

                    if (
                        loaded ===
                        selectedPhotoCount
                    ) {
                        drawFinalCanvas(
                            canvas,
                            images
                        );
                    }
                };

                image.src = src;

                images[index] =
                    image;
            }
        );
}


/* ========================================
   DRAW FINAL CANVAS
======================================== */

function drawFinalCanvas(
    canvas,
    images
) {
    if (
        selectedLayout ===
        "classic"
    ) {
        drawClassicStrip(
            canvas,
            images
        );

    } else if (
        selectedLayout ===
        "four"
    ) {
        drawFourStrip(
            canvas,
            images
        );

    } else if (
        selectedLayout ===
        "grid"
    ) {
        drawGrid(
            canvas,
            images
        );
    }
}


/* ========================================
   CLASSIC 3 PHOTO STRIP
======================================== */

function drawClassicStrip(
    canvas,
    images
) {
    const width = 600;

    const photoWidth = 540;
    const photoHeight = 405;

    const sidePadding = 30;
    const gap = 20;

    const topPadding = 30;
    const bottomArea = 90;


    canvas.width =
        width;

    canvas.height =
        topPadding +
        photoHeight * 3 +
        gap * 2 +
        bottomArea;


    const ctx =
        canvas.getContext("2d");


    /* ========================================
       WHITE BACKGROUND
    ======================================== */

    ctx.fillStyle =
        "#ffffff";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    /* ========================================
       DRAW PHOTOS
    ======================================== */

    for (
        let i = 0;
        i < 3;
        i++
    ) {
        drawCoverImage(
            ctx,
            images[i],
            sidePadding,
            topPadding +
                i *
                    (
                        photoHeight +
                        gap
                    ),
            photoWidth,
            photoHeight
        );
    }


    /* ========================================
       DRAW LABEL
    ======================================== */

    drawLabel(
        ctx,
        width / 2,
        canvas.height - 35
    );
}


/* ========================================
   FOUR PHOTO STRIP
======================================== */

function drawFourStrip(
    canvas,
    images
) {
    const width = 600;

    const photoWidth = 540;
    const photoHeight = 360;

    const sidePadding = 30;
    const gap = 18;

    const topPadding = 30;
    const bottomArea = 90;


    canvas.width =
        width;

    canvas.height =
        topPadding +
        photoHeight * 4 +
        gap * 3 +
        bottomArea;


    const ctx =
        canvas.getContext("2d");


    /* ========================================
       WHITE BACKGROUND
    ======================================== */

    ctx.fillStyle =
        "#ffffff";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    /* ========================================
       DRAW PHOTOS
    ======================================== */

    for (
        let i = 0;
        i < 4;
        i++
    ) {
        drawCoverImage(
            ctx,
            images[i],
            sidePadding,
            topPadding +
            (continued)