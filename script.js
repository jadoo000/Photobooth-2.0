javascript
/* ========================================
   PHOTO BOOTH DATA
======================================== */

let selectedLayout =
    localStorage.getItem("selectedLayout") || "classic";

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
   SELECT LAYOUT
======================================== */

function selectLayout(button) {

    const options =
        document.querySelectorAll(".layout-option");

    options.forEach(option => {
        option.classList.remove("selected");
    });

    button.classList.add("selected");

    selectedLayout =
        button.dataset.layout;

    selectedPhotoCount =
        parseInt(button.dataset.photos);

    localStorage.setItem(
        "selectedLayout",
        selectedLayout
    );

    localStorage.setItem(
        "selectedPhotoCount",
        selectedPhotoCount
    );
}


/* ========================================
   START PHOTO BOOTH
======================================== */

function startPhotoBooth() {

    capturedPhotos = [];

    capturedFilters = [];

    retakeIndex = null;

    selectedFilter = "normal";

    localStorage.setItem(
        "selectedLayout",
        selectedLayout
    );

    localStorage.setItem(
        "selectedPhotoCount",
        selectedPhotoCount
    );

    localStorage.setItem(
        "selectedFilter",
        selectedFilter
    );

    localStorage.removeItem(
        "capturedPhotos"
    );

    localStorage.removeItem(
        "capturedFilters"
    );

    window.location.href =
        "capture.html";
}


/* ========================================
   BACK HOME
======================================== */

function goBackHome() {

    stopCamera();

    window.location.href =
        "index.html";
}


/* ========================================
   SELECT FILTER
======================================== */

function selectFilter(filter) {

    selectedFilter =
        filter;

    localStorage.setItem(
        "selectedFilter",
        selectedFilter
    );

    const buttons =
        document.querySelectorAll(
            ".filter-button"
        );

    buttons.forEach(button => {
        button.classList.remove("active");
    });

    const selectedButton =
        document.querySelector(
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

    const video =
        document.getElementById(
            "cameraVideo"
        );

    if (!video) {
        return;
    }

    video.style.filter =
        filterCSS[selectedFilter] || "none";
}


/* ========================================
   START CAMERA
======================================== */

async function startCamera() {

    try {

        stopCamera();

        cameraStream =
            await navigator.mediaDevices.getUserMedia({

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

        const video =
            document.getElementById(
                "cameraVideo"
            );

        const placeholder =
            document.getElementById(
                "cameraPlaceholder"
            );

        const captureButton =
            document.getElementById(
                "captureButton"
            );

        if (!video) {
            return;
        }

        video.srcObject =
            cameraStream;

        video.style.display =
            "block";

        if (placeholder) {
            placeholder.style.display =
                "none";
        }

        if (captureButton) {
            captureButton.disabled =
                false;
        }

        if (
            currentCamera ===
            "environment"
        ) {

            video.classList.add(
                "back-camera"
            );

        } else {

            video.classList.remove(
                "back-camera"
            );

        }

        applyCameraFilter();

        updateCounter();

    } catch (error) {

        console.error(
            "Camera error:",
            error
        );

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

    cameraStream =
        null;
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

    const counter =
        document.getElementById(
            "photoCounter"
        );

    if (!counter) {
        return;
    }

    if (retakeIndex !== null) {

        counter.textContent =
            `Retaking photo ${retakeIndex + 1}`;

        return;
    }

    if (
        capturedPhotos.length >=
        selectedPhotoCount
    ) {

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

    const video =
        document.getElementById(
            "cameraVideo"
        );

    if (
        !cameraStream ||
        !video ||
        video.style.display === "none"
    ) {

        alert(
            "Please open the camera first."
        );

        return;
    }

    if (
        retakeIndex === null &&
        capturedPhotos.length >=
        selectedPhotoCount
    ) {

        return;
    }

    isTakingPhoto =
        true;

    const targetIndex =
        retakeIndex;

    retakeIndex =
        null;

    updateCounter();

    await runCountdown();

    triggerFlash();

    playShutterSound();

    await wait(150);


    /* ====================================
       CREATE IMAGE
    ==================================== */

    const canvas =
        document.createElement(
            "canvas"
        );

    canvas.width =
        video.videoWidth;

    canvas.height =
        video.videoHeight;

    const context =
        canvas.getContext(
            "2d"
        );


    /*
       Save the image normally.
       CSS mirroring is only for the preview.
    */

    context.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
    );


    /*
       APPLY FILTER TO PHOTO
    */

    applyFilterToCanvas(
        context,
        canvas.width,
        canvas.height,
        selectedFilter
    );


    const photo =
        canvas.toDataURL(
            "image/jpeg",
            0.92
        );


    /* ====================================
       SAVE PHOTO
    ==================================== */

    if (
        targetIndex !== null
    ) {

        capturedPhotos[
            targetIndex
        ] = photo;

        capturedFilters[
            targetIndex
        ] = selectedFilter;

    } else {

        capturedPhotos.push(
            photo
        );

        capturedFilters.push(
            selectedFilter
        );
    }


    localStorage.setItem(
        "capturedPhotos",
        JSON.stringify(capturedPhotos)
    );

    localStorage.setItem(
        "capturedFilters",
        JSON.stringify(capturedFilters)
    );


    updatePreview();

    updateCounter();

    isTakingPhoto =
        false;


    if (
        capturedPhotos.length >=
        selectedPhotoCount
    ) {

        const finishButton =
            document.getElementById(
                "finishButton"
            );

        if (finishButton) {

            finishButton.disabled =
                false;

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

    if (
        filter === "normal"
    ) {
        return;
    }

    const imageData =
        context.getImageData(
            0,
            0,
            width,
            height
        );

    const data =
        imageData.data;

    for (
        let i = 0;
        i < data.length;
        i += 4
    ) {

        let r =
            data[i];

        let g =
            data[i + 1];

        let b =
            data[i + 2];


        if (
            filter === "bw"
        ) {

            const gray =
                0.299 * r +
                0.587 * g +
                0.114 * b;

            r = gray;
            g = gray;
            b = gray;

        }

        else if (
            filter === "sepia"
        ) {

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

        else if (
            filter === "vintage"
        ) {

            r =
                r * 1.08 + 10;

            g =
                g * 0.95 + 5;

            b =
                b * 0.82;

        }

        else if (
            filter === "cool"
        ) {

            r =
                r * 0.88;

            g =
                g * 1.02;

            b =
                b * 1.15;

        }

        else if (
            filter === "warm"
        ) {

            r =
                r * 1.12;

            g =
                g * 1.03;

            b =
                b * 0.88;

        }

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

    return new Promise(
        resolve => {

            const countdown =
                document.getElementById(
                    "countdown"
                );

            if (!countdown) {

                resolve();

                return;
            }

            let number =
                3;

            countdown.textContent =
                number;

            const timer =
                setInterval(
                    () => {

                        number--;

                        if (
                            number <= 0
                        ) {

                            clearInterval(
                                timer
                            );

                            countdown.textContent =
                                "📸";

                            setTimeout(
                                () => {

                                    countdown.textContent =
                                        "";

                                    resolve();

                                },
                                350
                            );

                            return;
                        }

                        countdown.textContent =
                            number;

                    },
                    1000
                );
        }
    );
}


/* ========================================
   FLASH
======================================== */

function triggerFlash() {

    const flash =
        document.getElementById(
            "cameraFlash"
        );

    if (!flash) {
        return;
    }

    flash.classList.remove(
        "active"
    );

    void flash.offsetWidth;

    flash.classList.add(
        "active"
    );
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

        oscillator.type =
            "square";

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

        oscillator.connect(
            gain
        );

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

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                milliseconds
            )
    );
}


/* ========================================
   UPDATE LIVE PREVIEW
======================================== */

function updatePreview() {

    const preview =
        document.getElementById(
            "photoPreview"
        );

    if (!preview) {
        return;
    }

    preview.innerHTML =
        "";

    const strip =
        document.createElement(
            "div"
        );

    strip.className =
        "preview-strip";

    if (
        selectedLayout ===
        "grid"
    ) {

        strip.classList.add(
            "preview-grid"
        );
    }


    for (
        let i = 0;
        i < selectedPhotoCount;
        i++
    ) {

        const slot =
            document.createElement(
                "div"
            );

        slot.className =
            "preview-slot";

        if (
            capturedPhotos[i]
        ) {

            const image =
                document.createElement(
                    "img"
                );

            image.src =
                capturedPhotos[i];

            image.alt =
                `Photo ${i + 1}`;

            slot.appendChild(
                image
            );


            const filterBadge =
                document.createElement(
                    "span"
                );

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


            const retake =
                document.createElement(
                    "button"
                );

            retake.className =
                "retake-button";

            retake.textContent =
                "RETAKE";

            retake.onclick =
                () => {
                    retakePhoto(i);
                };

            slot.appendChild(
                retake
            );

        } else {

            slot.classList.add(
                "empty"
            );

            slot.textContent =
                `PHOTO ${i + 1}`;
        }

        strip.appendChild(
            slot
        );
    }


    const label =
        document.createElement(
            "div"
        );

    label.className =
        "preview-label";

    label.textContent =
        "PHOTO BOOTH";

    strip.appendChild(
        label
    );

    preview.appendChild(
        strip
    );
}


/* ========================================
   RETAKE INDIVIDUAL PHOTO
======================================== */

function retakePhoto(index) {

    if (isTakingPhoto) {
        return;
    }

    retakeIndex =
        index;

    selectedFilter =
        capturedFilters[index] ||
        "normal";

    localStorage.setItem(
        "selectedFilter",
        selectedFilter
    );

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

    applyCameraFilter();

    updateCounter();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* ========================================
   FINISH CAPTURE
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
        "customize.html";
}


/* ========================================
   RESULT LAYOUT ENGINE
======================================== */

function createFinalPhoto() {

    const canvas =
        document.getElementById(
            "finalCanvas"
        );

    if (!canvas) {
        return;
    }

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


    const layoutName =
        document.getElementById(
            "resultLayoutName"
        );

    if (layoutName) {

        layoutName.textContent =
            layoutNames[
                selectedLayout
            ] ||
            "Photo Booth";
    }


    const images =
        [];

    let loaded =
        0;

    const photosToLoad =
        capturedPhotos.slice(
            0,
            selectedPhotoCount
        );


    if (!photosToLoad.length) {
        return;
    }


    photosToLoad.forEach(
        (src, index) => {

            const image =
                new Image();

            image.onload =
                () => {

                    loaded++;

                    if (
                        loaded ===
                        photosToLoad.length
                    ) {

                        drawFinalCanvas(
                            canvas,
                            images
                        );
                    }
                };

            image.src =
                src;

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

    }

    else if (
        selectedLayout ===
        "four"
    ) {

        drawFourStrip(
            canvas,
            images
        );

    }

    else if (
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

    const width =
        600;

    const photoWidth =
        540;

    const photoHeight =
        405;

    const sidePadding =
        30;

    const gap =
        20;

    const topPadding =
        30;

    const bottomArea =
        90;

    canvas.width =
        width;

    canvas.height =
        topPadding +
        (photoHeight * 3) +
        (gap * 2) +
        bottomArea;

    const ctx =
        canvas.getContext(
            "2d"
        );

    ctx.fillStyle =
        "#ffffff";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

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
            (
                i *
                (
                    photoHeight +
                    gap
                )
            ),
            photoWidth,
            photoHeight
        );
    }

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

    const width =
        600;

    const photoWidth =
        540;

    const photoHeight =
        360;

    const sidePadding =
        30;

    const gap =
        18;

    const topPadding =
        30;

    const bottomArea =
        90;

    canvas.width =
        width;

    canvas.height =
        topPadding +
        (photoHeight * 4) +
        (gap * 3) +
        bottomArea;

    const ctx =
        canvas.getContext(
            "2d"
        );

    ctx.fillStyle =
        "#ffffff";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

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
            (
                i *
                (
                    photoHeight +
                    gap
                )
            ),
            photoWidth,
            photoHeight
        );
    }

    drawLabel(
        ctx,
        width / 2,
        canvas.height - 35
    );
}


/* ========================================
   2 × 2 GRID
======================================== */

function drawGrid(
    canvas,
    images
) {

    const width =
        700;

    const height =
        700;

    const padding =
        30;

    const gap =
        20;

    const labelHeight =
        80;

    const photoWidth =
        (
            width -
            (padding * 2) -
            gap
        ) / 2;

    const photoHeight =
        (
            height -
            padding -
            labelHeight -
            gap
        ) / 2;

    canvas.width =
        width;

    canvas.height =
        height;

    const ctx =
        canvas.getContext(
            "2d"
        );

    ctx.fillStyle =
        "#ffffff";

    ctx.fillRect(
        0,
        0,
        width,
        height
    );

    const positions = [

        [
            padding,
            padding
        ],

        [
            padding +
            photoWidth +
            gap,
            padding
        ],

        [
            padding,
            padding +
            photoHeight +
            gap
        ],

        [
            padding +
            photoWidth +
            gap,
            padding +
            photoHeight +
            gap
        ]

    ];


    for (
        let i = 0;
        i < 4;
        i++
    ) {

        drawCoverImage(
            ctx,
            images[i],
            positions[i][0],
            positions[i][1],
            photoWidth,
            photoHeight
        );
    }

    drawLabel(
        ctx,
        width / 2,
        height - 35
    );
}


/* ========================================
   COVER IMAGE
======================================== */

function drawCoverImage(
    ctx,
    image,
    x,
    y,
    width,
    height
) {

    if (!image) {
        return;
    }

    const imageRatio =
        image.width /
        image.height;

    const boxRatio =
        width /
        height;

    let sourceWidth =
        image.width;

    let sourceHeight =
        image.height;

    let sourceX =
        0;

    let sourceY =
        0;


    if (
        imageRatio >
        boxRatio
    ) {

        sourceWidth =
            image.height *
            boxRatio;

        sourceX =
            (
                image.width -
                sourceWidth
            ) / 2;

    } else {

        sourceHeight =
            image.width /
            boxRatio;

        sourceY =
            (
                image.height -
                sourceHeight
            ) / 2;
    }


    ctx.drawImage(
        image,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        x,
        y,
        width,
        height
    );
}


/* ========================================
   PHOTO BOOTH LABEL
======================================== */

function drawLabel(
    ctx,
    x,
    y
) {

    ctx.fillStyle =
        "#28657d";

    ctx.font =
        "bold 28px Arial";

    ctx.textAlign =
        "center";

    ctx.fillText(
        "PHOTO BOOTH",
        x,
        y
    );
}


/* ========================================
   DOWNLOAD
======================================== */

function downloadPhoto() {

    const canvas =
        document.getElementById(
            "finalCanvas"
        );

    if (!canvas) {
        return;
    }

    const link =
        document.createElement(
            "a"
        );

    link.download =
        `photo-booth-${selectedLayout}.png`;

    link.href =
        canvas.toDataURL(
            "image/png"
        );

    link.click();
}


/* ========================================
   RETAKE ALL
======================================== */

function retakePhotos() {

    capturedPhotos =
        [];

    capturedFilters =
        [];

    localStorage.removeItem(
        "capturedPhotos"
    );

    localStorage.removeItem(
        "capturedFilters"
    );

    window.location.href =
        "capture.html";
}


/* ========================================
   PRINT PHOTO
======================================== */

function printPhoto() {

    const modal =
        document.getElementById(
            "printModal"
        );

    if (!modal) {
        return;
    }

    modal.classList.add(
        "active"
    );

    copyCanvasToPrinter();
}


/* ========================================
   COPY FINAL CANVAS TO PRINTER
======================================== */

function copyCanvasToPrinter() {

    const original =
        document.getElementById(
            "finalCanvas"
        );

    const printerCanvas =
        document.getElementById(
            "printCanvas"
        );

    if (
        !original ||
        !printerCanvas
    ) {
        return;
    }

    printerCanvas.width =
        original.width;

    printerCanvas.height =
        original.height;

    const context =
        printerCanvas.getContext(
            "2d"
        );

    context.drawImage(
        original,
        0,
        0
    );
}


/* ========================================
   START PRINTING
======================================== */

function startPrinting() {

    const status =
        document.getElementById(
            "printerStatus"
        );

    const photo =
        document.getElementById(
            "printedPhoto"
        );

    const button =
        document.getElementById(
            "startPrintButton"
        );

    if (
        !status ||
        !photo ||
        !button
    ) {
        return;
    }

    status.textContent =
        "Printing...";

    button.disabled =
        true;

    photo.classList.remove(
        "printing"
    );

    void photo.offsetWidth;

    photo.classList.add(
        "printing"
    );

    setTimeout(
        () => {

            status.textContent =
                "Printing complete!";

            button.disabled =
                false;

            button.textContent =
                "PRINT AGAIN";

        },
        5000
    );
}


/* ========================================
   CLOSE PRINT
======================================== */

function closePrint() {

    const modal =
        document.getElementById(
            "printModal"
        );

    if (!modal) {
        return;
    }

    modal.classList.remove(
        "active"
    );
}


/* =====================================================
   STAGE 5 - CUSTOMIZATION DATA
===================================================== */

let customizationBackground =
    localStorage.getItem(
        "customizationBackground"
    ) || "#ffffff";

let customizationFrame =
    localStorage.getItem(
        "customizationFrame"
    ) || "none";

let customizationText =
    localStorage.getItem(
        "customizationText"
    ) || "";

let customizationShowDate =
    localStorage.getItem(
        "customizationShowDate"
    ) === "true";


/* ========================================
   SELECT BACKGROUND
======================================== */

function selectBackground(
    color,
    button
) {

    customizationBackground =
        color;

    localStorage.setItem(
        "customizationBackground",
        color
    );

    const buttons =
        document.querySelectorAll(
            ".background-button"
        );

    buttons.forEach(button => {

        button.classList.remove(
            "active"
        );

    });

    if (button) {

        button.classList.add(
            "active"
        );

    }

    updateCustomizationPreview();
}


/* ========================================
   SELECT FRAME
======================================== */

function selectFrame(
    frame,
    button
) {

    customizationFrame =
        frame;

    localStorage.setItem(
        "customizationFrame",
        frame
    );

    const buttons =
        document.querySelectorAll(
            ".frame-button"
        );

    buttons.forEach(button => {

        button.classList.remove(
            "active"
        );

    });

    if (button) {

        button.classList.add(
            "active"
        );

    }

    updateCustomizationPreview();
}


/* ========================================
   UPDATE CUSTOM TEXT
======================================== */

function updateCustomText(
    text
) {

    customizationText =
        text;

    localStorage.setItem(
        "customizationText",
        text
    );

    updateCustomizationPreview();
}


/* ========================================
   TOGGLE DATE
======================================== */

function toggleDate(
    enabled
) {

    customizationShowDate =
        enabled;

    localStorage.setItem(
        "customizationShowDate",
        enabled
    );

    updateCustomizationPreview();
}


/* ========================================
   BACK TO CAPTURE
======================================== */

function backToCapture() {

    window.location.href =
        "capture.html";
}


/* ========================================
   LOAD CUSTOMIZATION PREVIEW
======================================== */

function createCustomizationPreview() {

    const canvas =
        document.getElementById(
            "customizeCanvas"
        );

    if (!canvas) {
        return;
    }


    capturedPhotos =
        JSON.parse(
            localStorage.getItem(
                "capturedPhotos"
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


    customizationBackground =
        localStorage.getItem(
            "customizationBackground"
        ) || "#ffffff";


    customizationFrame =
        localStorage.getItem(
            "customizationFrame"
        ) || "none";


    customizationText =
        localStorage.getItem(
            "customizationText"
        ) || "";


    customizationShowDate =
        localStorage.getItem(
            "customizationShowDate"
        ) === "true";


    const textInput =
        document.getElementById(
            "customText"
        );

    if (textInput) {

        textInput.value =
            customizationText;

    }


    const dateCheckbox =
        document.getElementById(
            "showDate"
        );

    if (dateCheckbox) {

        dateCheckbox.checked =
            customizationShowDate;

    }


    const backgroundButton =
        document.querySelector(
            `[data-background="${customizationBackground}"]`
        );

    if (backgroundButton) {

        selectBackground(
            customizationBackground,
            backgroundButton
        );

    }


    const frameButton =
        document.querySelector(
            `[data-frame="${customizationFrame}"]`
        );

    if (frameButton) {

        selectFrame(
            customizationFrame,
            frameButton
        );

    }


    drawCustomizationCanvas();
}


/* ========================================
   UPDATE CUSTOMIZATION PREVIEW
======================================== */

function updateCustomizationPreview() {

    drawCustomizationCanvas();

}


/* ========================================
   DRAW CUSTOMIZATION CANVAS
======================================== */

async function drawCustomizationCanvas() {

    const canvas =
        document.getElementById(
            "customizeCanvas"
        );

    if (!canvas) {
        return;
    }


    const images =
        [];

    let loaded =
        0;


    const photos =
        capturedPhotos.slice(
            0,
            selectedPhotoCount
        );


    if (!photos.length) {
        return;
    }


    photos.forEach(
        (src, index) => {

            const image =
                new Image();

            image.onload =
                () => {

                    loaded++;

                    if (
                        loaded ===
                        photos.length
                    ) {

                        drawCustomizationLayout(
                            canvas,
                            images
                        );

                    }

                };

            image.src =
                src;

            images[index] =
                image;

        }
    );
}


/* ========================================
   DRAW CUSTOMIZATION LAYOUT
======================================== */

function drawCustomizationLayout(
    canvas,
    images
) {

    if (
        selectedLayout ===
        "classic"
    ) {

        drawCustomClassic(
            canvas,
            images
        );

    }

    else if (
        selectedLayout ===
        "four"
    ) {

        drawCustomFour(
            canvas,
            images
        );

    }

    else if (
        selectedLayout ===
        "grid"
    ) {

        drawCustomGrid(
            canvas,
            images
        );

    }
}


/* ========================================
   CUSTOM CLASSIC
======================================== */

function drawCustomClassic(
    canvas,
    images
) {

    const width =
        600;

    const photoWidth =
        540;

    const photoHeight =
        405;

    const padding =
        30;

    const gap =
        20;

    const bottomArea =
        110;


    canvas.width =
        width;

    canvas.height =
        padding +
        (photoHeight * 3) +
        (gap * 2) +
        bottomArea;


    drawCustomizationBackground(
        canvas
    );


    const ctx =
        canvas.getContext(
            "2d"
        );


    for (
        let i = 0;
        i < 3;
        i++
    ) {

        drawCoverImage(
            ctx,
            images[i],
            padding,
            padding +
            i *
            (
                photoHeight +
                gap
            ),
            photoWidth,
            photoHeight
        );

    }


    drawCustomizationDetails(
        ctx,
        canvas
    );
}


/* ========================================
   CUSTOM FOUR
======================================== */

function drawCustomFour(
    canvas,
    images
) {

    const width =
        600;

    const photoWidth =
        540;

    const photoHeight =
        360;

    const padding =
        30;

    const gap =
        18;

    const bottomArea =
        110;


    canvas.width =
        width;

    canvas.height =
        padding +
        (photoHeight * 4) +
        (gap * 3) +
        bottomArea;


    drawCustomizationBackground(
        canvas
    );


    const ctx =
        canvas.getContext(
            "2d"
        );


    for (
        let i = 0;
        i < 4;
        i++
    ) {

        drawCoverImage(
            ctx,
            images[i],
            padding,
            padding +
            i *
            (
                photoHeight +
                gap
            ),
            photoWidth,
            photoHeight
        );

    }


    drawCustomizationDetails(
        ctx,
        canvas
    );
}


/* ========================================
   CUSTOM GRID
======================================== */

function drawCustomGrid(
    canvas,
    images
) {

    const width =
        700;

    const height =
        700;

    const padding =
        30;

    const gap =
        20;

    const labelHeight =
        110;


    const photoWidth =
        (
            width -
            (padding * 2) -
            gap
        ) / 2;


    const photoHeight =
        (
            height -
            padding -
            labelHeight -
            gap
        ) / 2;


    canvas.width =
        width;

    canvas.height =
        height;


    drawCustomizationBackground(
        canvas
    );


    const ctx =
        canvas.getContext(
            "2d"
        );


    const positions = [

        [
            padding,
            padding
        ],

        [
            padding +
            photoWidth +
            gap,
            padding
        ],

        [
            padding,
            padding +
            photoHeight +
            gap
        ],

        [
            padding +
            photoWidth +
            gap,
            padding +
            photoHeight +
            gap
        ]

    ];


    for (
        let i = 0;
        i < 4;
        i++
    ) {

        drawCoverImage(
            ctx,
            images[i],
            positions[i][0],
            positions[i][1],
            photoWidth,
            photoHeight
        );

    }


    drawCustomizationDetails(
        ctx,
        canvas
    );
}


/* ========================================
   CUSTOMIZATION BACKGROUND
======================================== */

function drawCustomizationBackground(
    canvas
) {

    const ctx =
        canvas.getContext(
            "2d"
        );

    ctx.fillStyle =
        customizationBackground;

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );
}


/* ========================================
   CUSTOMIZATION DETAILS
======================================== */

function drawCustomizationDetails(
    ctx,
    canvas
) {

    const centerX =
        canvas.width / 2;

    const bottomY =
        canvas.height - 65;


    /* ====================================
       FRAME
    ==================================== */

    if (
        customizationFrame ===
        "simple"
    ) {

        ctx.strokeStyle =
            "#28657d";

        ctx.lineWidth =
            12;

        ctx.strokeRect(
            8,
            8,
            canvas.width - 16,
            canvas.height - 16
        );

    }


    else if (
        customizationFrame ===
        "rounded"
    ) {

        ctx.strokeStyle =
            "#28657d";

        ctx.lineWidth =
            10;

        drawRoundedRectangle(
            ctx,
            8,
            8,
            canvas.width - 16,
            canvas.height - 16,
            30
        );

    }


    else if (
        customizationFrame ===
        "double"
    ) {

        ctx.strokeStyle =
            "#28657d";

        ctx.lineWidth =
            6;

        ctx.strokeRect(
            10,
            10,
            canvas.width - 20,
            canvas.height - 20
        );

        ctx.lineWidth =
            3;

        ctx.strokeRect(
            20,
            20,
            canvas.width - 40,
            canvas.height - 40
        );

    }


    /* ====================================
       CUSTOM TEXT OR DEFAULT LABEL
    ==================================== */

    ctx.fillStyle =
        "#28657d";

    ctx.textAlign =
        "center";


    if (
        customizationText
    ) {

        ctx.font =
            "bold 24px Arial";

        ctx.fillText(
            customizationText,
            centerX,
            bottomY
        );

    } else {

        ctx.font =
            "bold 24px Arial";

        ctx.fillText(
            "PHOTO BOOTH",
            centerX,
            bottomY
        );

    }


    /* ====================================
       DATE
    ==================================== */

    if (
        customizationShowDate
    ) {

        const today =
            new Date();

        const dateText =
            today.toLocaleDateString();

        ctx.fillStyle =
            "#28657d";

        ctx.font =
            "16px Arial";

        ctx.fillText(
            dateText,
            centerX,
            canvas.height - 30
        );

    }
}


/* ========================================
   ROUNDED RECTANGLE
======================================== */

function drawRoundedRectangle(
    ctx,
    x,
    y,
    width,
    height,
    radius
) {

    ctx.beginPath();

    if (
        typeof ctx.roundRect ===
        "function"
    ) {

        ctx.roundRect(
            x,
            y,
            width,
            height,
            radius
        );

    } else {

        ctx.moveTo(
            x + radius,
            y
        );

        ctx.lineTo(
            x + width - radius,
            y
        );

        ctx.quadraticCurveTo(
            x + width,
            y,
            x + width,
            y + radius
        );

        ctx.lineTo(
            x + width,
            y + height - radius
        );

        ctx.quadraticCurveTo(
            x + width,
            y + height,
            x + width - radius,
            y + height
        );

        ctx.lineTo(
            x + radius,
            y + height
        );

        ctx.quadraticCurveTo(
            x,
            y + height,
            x,
            y + height - radius
        );

        ctx.lineTo(
            x,
            y + radius
        );

        ctx.quadraticCurveTo(
            x,
            y,
            x + radius,
            y
        );

    }

    ctx.closePath();

    ctx.stroke();
}


/* ========================================
   FINISH CUSTOMIZATION
======================================== */

function finishCustomization() {

    localStorage.setItem(
        "customizationBackground",
        customizationBackground
    );

    localStorage.setItem(
        "customizationFrame",
        customizationFrame
    );

    localStorage.setItem(
        "customizationText",
        customizationText
    );

    localStorage.setItem(
        "customizationShowDate",
        customizationShowDate
    );

    window.location.href =
        "result.html";
}


/* ========================================
   PAGE INITIALIZATION
======================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /* ================================
           HOME PAGE
        ================================= */

        const layoutOptions =
            document.querySelectorAll(
                ".layout-option"
            );


        layoutOptions.forEach(
            option => {

                if (
                    option.dataset.layout ===
                    selectedLayout
                ) {

                    option.classList.add(
                        "selected"
                    );

                }

            }
        );


        /* ================================
           CAPTURE PAGE
        ================================= */

        if (
            document.body.classList.contains(
                "capture-page"
            )
        ) {

            selectedFilter =
                localStorage.getItem(
                    "selectedFilter"
                ) || "normal";


            const activeButton =
                document.querySelector(
                    `[data-filter="${selectedFilter}"]`
                );


            if (activeButton) {

                activeButton.classList.add(
                    "active"
                );

            }


            applyCameraFilter();

            updatePreview();

            updateCounter();

        }


        /* ================================
           CUSTOMIZE PAGE
        ================================= */

        if (
            document.body.classList.contains(
                "customize-page"
            )
        ) {

            createCustomizationPreview();

        }


        /* ================================
           RESULT PAGE
        ================================= */

        if (
            document.body.classList.contains(
                "result-page"
            )
        ) {

            createFinalPhoto();

        }

    }
);
```
