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
   CUSTOMIZATION DATA
======================================== */

let selectedBackground =
    localStorage.getItem("selectedBackground") || "#ffffff";

let selectedFrame =
    localStorage.getItem("selectedFrame") || "none";

let customText =
    localStorage.getItem("customText") || "";

let showDate =
    localStorage.getItem("showDate") === "true";


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

    vintage:
        "sepia(0.25) contrast(1.05) saturate(0.85)",

    bw:
        "grayscale(1)",

    sepia:
        "sepia(0.75) contrast(1.05)",

    cool:
        "saturate(0.85) hue-rotate(15deg) brightness(1.05)",

    warm:
        "saturate(1.3) sepia(0.15) brightness(1.05)"

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


    /* Reset customization */

    selectedBackground = "#ffffff";

    selectedFrame = "none";

    customText = "";

    showDate = false;


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


    localStorage.removeItem(
        "selectedBackground"
    );

    localStorage.removeItem(
        "selectedFrame"
    );

    localStorage.removeItem(
        "customText"
    );

    localStorage.removeItem(
        "showDate"
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

        button.classList.remove(
            "active"
        );

    });


    const selectedButton =
        document.querySelector(
            `[data-filter="${filter}"]`
        );


    if (selectedButton) {

        selectedButton.classList.add(
            "active"
        );

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
        filterCSS[selectedFilter] ||
        "none";

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

                    facingMode:
                        currentCamera,

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


        /*
            Keep selfie preview mirrored.
        */

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


        /*
            Re-apply selected filter.
        */

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


    /*
        Countdown.
    */

    await runCountdown();


    /*
        Flash.
    */

    triggerFlash();


    /*
        Shutter sound.
    */

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
        The camera preview may be mirrored
        using CSS.

        The actual saved photo is NOT mirrored.
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


    /*
        Convert to image.
    */

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


    /*
        Save to localStorage.
    */

    localStorage.setItem(

        "capturedPhotos",

        JSON.stringify(
            capturedPhotos
        )

    );


    localStorage.setItem(

        "capturedFilters",

        JSON.stringify(
            capturedFilters
        )

    );


    /*
        Update preview.
    */

    updatePreview();


    updateCounter();


    isTakingPhoto =
        false;


    /*
        Enable finish button.
    */

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


            r =
                gray;

            g =
                gray;

            b =
                gray;

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


            r =
                newR;

            g =
                newG;

            b =
                newB;

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


            r =
                Math.min(
                    255,
                    r
                );

            g =
                Math.min(
                    255,
                    g
                );

            b =
                Math.min(
                    255,
                    b
                );

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
                Math.min(
                    255,
                    r
                )
            );


        data[i + 1] =
            Math.max(
                0,
                Math.min(
                    255,
                    g
                )
            );


        data[i + 2] =
            Math.max(
                0,
                Math.min(
                    255,
                    b
                )
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
            audioContext
                .createOscillator();


        const gain =
            audioContext
                .createGain();


        oscillator.type =
            "square";


        oscillator.frequency
            .setValueAtTime(

                900,

                audioContext.currentTime

            );


        oscillator.frequency
            .exponentialRampToValueAtTime(

                150,

                audioContext.currentTime +
                0.12

            );


        gain.gain
            .setValueAtTime(

                0.3,

                audioContext.currentTime

            );


        gain.gain
            .exponentialRampToValueAtTime(

                0.01,

                audioContext.currentTime +
                0.12

            );


        oscillator.connect(
            gain
        );


        gain.connect(
            audioContext.destination
        );


        oscillator.start();


        oscillator.stop(

            audioContext.currentTime +
            0.12

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

        JSON.stringify(
            capturedPhotos
        )

    );


    localStorage.setItem(

        "capturedFilters",

        JSON.stringify(
            capturedFilters
        )

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


    /*
        GO TO CUSTOMIZATION
    */

    window.location.href =
        "customize.html";

}


/* ========================================
   CUSTOMIZATION
======================================== */


/* ========================================
   BACK TO CAPTURE
======================================== */

function backToCapture() {

    window.location.href =
        "capture.html";

}


/* ========================================
   SELECT BACKGROUND
======================================== */

function selectBackground(

    background,

    button

) {

    selectedBackground =
        background;


    localStorage.setItem(

        "selectedBackground",

        selectedBackground

    );


    const buttons =
        document.querySelectorAll(

            ".background-button"

        );


    buttons.forEach(

        item => {

            item.classList.remove(
                "active"
            );

        }

    );


    if (button) {

        button.classList.add(
            "active"
        );

    }


    drawCustomizeCanvas();

}


/* ========================================
   SELECT FRAME
======================================== */

function selectFrame(

    frame,

    button

) {

    selectedFrame =
        frame;


    localStorage.setItem(

        "selectedFrame",

        selectedFrame

    );


    const buttons =
        document.querySelectorAll(

            ".frame-button"

        );


    buttons.forEach(

        item => {

            item.classList.remove(
                "active"
            );

        }

    );


    if (button) {

        button.classList.add(
            "active"
        );

    }


    drawCustomizeCanvas();

}


/* ========================================
   CUSTOM TEXT
======================================== */

function updateCustomText(

    text

) {

    customText =
        text;


    localStorage.setItem(

        "customText",

        customText

    );


    drawCustomizeCanvas();

}


/* ========================================
   TOGGLE DATE
======================================== */

function toggleDate(

    checked

) {

    showDate =
        checked;


    localStorage.setItem(

        "showDate",

        showDate

    );


    drawCustomizeCanvas();

}


/* ========================================
   FINISH CUSTOMIZATION
======================================== */

function finishCustomization() {

    localStorage.setItem(

        "selectedBackground",

        selectedBackground

    );


    localStorage.setItem(

        "selectedFrame",

        selectedFrame

    );


    localStorage.setItem(

        "customText",

        customText

    );


    localStorage.setItem(

        "showDate",

        showDate

    );


    window.location.href =
        "result.html";

}


/* ========================================
   CUSTOMIZATION CANVAS
======================================== */

function initializeCustomizePage() {

    const canvas =
        document.getElementById(
            "customizeCanvas"
        );


    if (!canvas) {

        return;

    }


    selectedBackground =
        localStorage.getItem(
            "selectedBackground"
        ) || "#ffffff";


    selectedFrame =
        localStorage.getItem(
            "selectedFrame"
        ) || "none";


    customText =
        localStorage.getItem(
            "customText"
        ) || "";


    showDate =
        localStorage.getItem(
            "showDate"
        ) === "true";


    const textInput =
        document.getElementById(
            "customText"
        );


    if (textInput) {

        textInput.value =
            customText;

    }


    const dateCheckbox =
        document.getElementById(
            "showDate"
        );


    if (dateCheckbox) {

        dateCheckbox.checked =
            showDate;

    }


    const backgroundButtons =
        document.querySelectorAll(

            ".background-button"

        );


    backgroundButtons.forEach(

        button => {

            button.classList.toggle(

                "active",

                button.dataset.background ===

                selectedBackground

            );

        }

    );


    const frameButtons =
        document.querySelectorAll(

            ".frame-button"

        );


    frameButtons.forEach(

        button => {

            button.classList.toggle(

                "active",

                button.dataset.frame ===

                selectedFrame

            );

        }

    );


    drawCustomizeCanvas();

}


/* ========================================
   DRAW CUSTOMIZATION PREVIEW
======================================== */

function drawCustomizeCanvas() {

    const canvas =
        document.getElementById(
            "customizeCanvas"
        );


    if (!canvas) {

        return;

    }


    const photos =
        JSON.parse(

            localStorage.getItem(
                "capturedPhotos"
            )

        ) || [];


    const layout =
        localStorage.getItem(
            "selectedLayout"
        ) || "classic";


    const photoCount =
        parseInt(

            localStorage.getItem(
                "selectedPhotoCount"
            )

        ) || 3;


    if (
        photos.length === 0
    ) {

        return;

    }


    const images = [];


    let loaded =
        0;


    photos

        .slice(
            0,
            photoCount
        )

        .forEach(

            (src, index) => {

                const image =
                    new Image();


                image.onload =
                    () => {

                        loaded++;


                        if (
                            loaded ===
                            Math.min(
                                photos.length,
                                photoCount
                            )
                        ) {

                            drawCustomizeLayout(

                                canvas,

                                images,

                                layout

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
   DRAW CUSTOMIZE LAYOUT
======================================== */

function drawCustomizeLayout(

    canvas,

    images,

    layout

) {

    let width;

    let height;


    if (
        layout === "grid"
    ) {

        width =
            700;

        height =
            700;

    }

    else if (
        layout === "four"
    ) {

        width =
            600;

        height =
            30 +
            (360 * 4) +
            (18 * 3) +
            90;

    }

    else {

        width =
            600;

        height =
            30 +
            (405 * 3) +
            (20 * 2) +
            90;

    }


    canvas.width =
        width;


    canvas.height =
        height;


    const ctx =
        canvas.getContext(
            "2d"
        );


    /*
        Background
    */

    ctx.fillStyle =
        selectedBackground;


    ctx.fillRect(

        0,

        0,

        width,

        height

    );


    /*
        Draw photos
    */

    if (
        layout === "classic"
    ) {

        drawCustomizeClassic(

            ctx,

            images,

            width,

            height

        );

    }


    else if (
        layout === "four"
    ) {

        drawCustomizeFour(

            ctx,

            images,

            width,

            height

        );

    }


    else if (
        layout === "grid"
    ) {

        drawCustomizeGrid(

            ctx,

            images,

            width,

            height

        );

    }


    /*
        Draw frame
    */

    drawCustomizeFrame(

        ctx,

        width,

        height

    );


    /*
        Draw text
    */

    drawCustomizeText(

        ctx,

        width,

        height

    );

}


/* ========================================
   CUSTOM CLASSIC
======================================== */

function drawCustomizeClassic(

    ctx,

    images,

    width,

    height

) {

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

}


/* ========================================
   CUSTOM FOUR
======================================== */

function drawCustomizeFour(

    ctx,

    images,

    width,

    height

) {

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

}


/* ========================================
   CUSTOM GRID
======================================== */

function drawCustomizeGrid(

    ctx,

    images,

    width,

    height

) {

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

}


/* ========================================
   CUSTOM FRAME
======================================== */

function drawCustomizeFrame(

    ctx,

    width,

    height

) {

    if (
        selectedFrame ===
        "none"
    ) {

        return;

    }


    ctx.save();


    if (
        selectedFrame ===
        "simple"
    ) {

        ctx.strokeStyle =
            "#28657d";


        ctx.lineWidth =
            12;


        ctx.strokeRect(

            10,

            10,

            width - 20,

            height - 20

        );

    }


    else if (
        selectedFrame ===
        "rounded"
    ) {

        ctx.strokeStyle =
            "#28657d";


        ctx.lineWidth =
            12;


        ctx.beginPath();


        ctx.roundRect(

            10,

            10,

            width - 20,

            height - 20,

            35

        );


        ctx.stroke();

    }


    else if (
        selectedFrame ===
        "double"
    ) {

        ctx.strokeStyle =
            "#28657d";


        ctx.lineWidth =
            8;


        ctx.strokeRect(

            12,

            12,

            width - 24,

            height - 24

        );


        ctx.lineWidth =
            3;


        ctx.strokeRect(

            25,

            25,

            width - 50,

            height - 50

        );

    }


    ctx.restore();

}


/* ========================================
   CUSTOM TEXT + DATE
======================================== */

function drawCustomizeText(

    ctx,

    width,

    height

) {

    const textY =
        height - 48;


    ctx.save();


    ctx.textAlign =
        "center";


    ctx.fillStyle =
        "#28657d";


    if (
        customText
    ) {

        ctx.font =
            "bold 24px Arial";


        ctx.fillText(

            customText,

            width / 2,

            textY

        );

    }


    if (
        showDate
    ) {

        const today =
            new Date();


        const dateText =

            today.toLocaleDateString(

                "en-US",

                {

                    year:
                        "numeric",

                    month:
                        "long",

                    day:
                        "numeric"

                }

            );


        ctx.font =
            "16px Arial";


        ctx.fillText(

            dateText,

            width / 2,

            height - 20

        );

    }


    if (
        !customText &&
        !showDate
    ) {

        ctx.font =
            "bold 28px Arial";


        ctx.fillText(

            "PHOTO BOOTH",

            width / 2,

            height - 35

        );

    }


    ctx.restore();

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


    /*
        Load customization.
    */

    selectedBackground =
        localStorage.getItem(
            "selectedBackground"
        ) || "#ffffff";


    selectedFrame =
        localStorage.getItem(
            "selectedFrame"
        ) || "none";


    customText =
        localStorage.getItem(
            "customText"
        ) || "";


    showDate =
        localStorage.getItem(
            "showDate"
        ) === "true";


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


    capturedPhotos

        .slice(
            0,
            selectedPhotoCount
        )

        .forEach(

            (src, index) => {

                const image =
                    new Image();


                image.onload =
                    () => {

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
        selectedBackground ||
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


    drawResultCustomization(

        ctx,

        width,

        canvas.height

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
        selectedBackground ||
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


    drawResultCustomization(

        ctx,

        width,

        canvas.height

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
        selectedBackground ||
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


    drawResultCustomization(

        ctx,

        width,

        height

    );

}


/* ========================================
   RESULT CUSTOMIZATION
======================================== */

function drawResultCustomization(

    ctx,

    width,

    height

) {

    /*
        Frame
    */

    if (
        selectedFrame !==
        "none"
    ) {

        ctx.save();


        if (
            selectedFrame ===
            "simple"
        ) {

            ctx.strokeStyle =
                "#28657d";


            ctx.lineWidth =
                12;


            ctx.strokeRect(

                10,

                10,

                width - 20,

                height - 20

            );

        }


        else if (
            selectedFrame ===
            "rounded"
        ) {

            ctx.strokeStyle =
                "#28657d";


            ctx.lineWidth =
                12;


            ctx.beginPath();


            ctx.roundRect(

                10,

                10,

                width - 20,

                height - 20,

                35

            );


            ctx.stroke();

        }


        else if (
            selectedFrame ===
            "double"
        ) {

            ctx.strokeStyle =
                "#28657d";


            ctx.lineWidth =
                8;


            ctx.strokeRect(

                12,

                12,

                width - 24,

                height - 24

            );


            ctx.lineWidth =
                3;


            ctx.strokeRect(

                25,

                25,

                width - 50,

                height - 50

            );

        }


        ctx.restore();

    }


    /*
        Text
    */

    ctx.save();


    ctx.textAlign =
        "center";


    ctx.fillStyle =
        "#28657d";


    if (
        customText
    ) {

        ctx.font =
            "bold 24px Arial";


        ctx.fillText(

            customText,

            width / 2,

            height - 48

        );

    }


    if (
        showDate
    ) {

        const today =
            new Date();


        const dateText =

            today.toLocaleDateString(

                "en-US",

                {

                    year:
                        "numeric",

                    month:
                        "long",

                    day:
                        "numeric"

                }

            );


        ctx.font =
            "16px Arial";


        ctx.fillText(

            dateText,

            width / 2,

            height - 20

        );

    }


    if (
        !customText &&
        !showDate
    ) {

        drawLabel(

            ctx,

            width / 2,

            height - 35

        );

    }


    ctx.restore();

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

    }

    else {

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


    localStorage.removeItem(

        "selectedBackground"

    );


    localStorage.removeItem(

        "selectedFrame"

    );


    localStorage.removeItem(

        "customText"

    );


    localStorage.removeItem(

        "showDate"

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

            document.body.classList

                .contains(

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

            document.body.classList

                .contains(

                    "customize-page"

                )

        ) {

            initializeCustomizePage();

        }


        /* ================================
           RESULT PAGE
        ================================= */

        if (

            document.body.classList

                .contains(

                    "result-page"

                )

        ) {

            createFinalPhoto();

        }

    }

);
```
/* ========================================
   STAGE 5 - CUSTOMIZE PAGE
======================================== */

/* ========================================
   CUSTOMIZATION DATA
======================================== */

let customizeBackground =
    localStorage.getItem("customizeBackground") || "#ffffff";

let customizeFrame =
    localStorage.getItem("customizeFrame") || "none";

let customizeText =
    localStorage.getItem("customizeText") || "";

let customizeShowDate =
    localStorage.getItem("customizeShowDate") === "true";


/* ========================================
   BACK TO CAPTURE
======================================== */

function backToCapture() {

    window.location.href =
        "capture.html";

}


/* ========================================
   SELECT BACKGROUND
======================================== */

function selectBackground(
    background,
    button
) {

    customizeBackground =
        background;


    localStorage.setItem(

        "customizeBackground",

        customizeBackground

    );


    /*
        Remove active state
        from all background buttons.
    */

    const buttons =
        document.querySelectorAll(
            ".background-button"
        );


    buttons.forEach(
        item => {

            item.classList.remove(
                "active"
            );

        }
    );


    /*
        Activate selected button.
    */

    if (button) {

        button.classList.add(
            "active"
        );

    }


    /*
        Redraw preview.
    */

    drawCustomizePreview();

}


/* ========================================
   SELECT FRAME
======================================== */

function selectFrame(
    frame,
    button
) {

    customizeFrame =
        frame;


    localStorage.setItem(

        "customizeFrame",

        customizeFrame

    );


    /*
        Remove active state
        from all frame buttons.
    */

    const buttons =
        document.querySelectorAll(
            ".frame-button"
        );


    buttons.forEach(
        item => {

            item.classList.remove(
                "active"
            );

        }
    );


    /*
        Activate selected button.
    */

    if (button) {

        button.classList.add(
            "active"
        );

    }


    /*
        Redraw preview.
    */

    drawCustomizePreview();

}


/* ========================================
   CUSTOM TEXT
======================================== */

function updateCustomText(
    value
) {

    customizeText =
        value;


    localStorage.setItem(

        "customizeText",

        customizeText

    );


    drawCustomizePreview();

}


/* ========================================
   TOGGLE DATE
======================================== */

function toggleDate(
    checked
) {

    customizeShowDate =
        checked;


    localStorage.setItem(

        "customizeShowDate",

        customizeShowDate

    );


    drawCustomizePreview();

}


/* ========================================
   GET TODAY'S DATE
======================================== */

function getTodayDate() {

    const today =
        new Date();


    const month =
        String(
            today.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            today.getDate()
        ).padStart(
            2,
            "0"
        );


    const year =
        today.getFullYear();


    return `${month}/${day}/${year}`;

}


/* ========================================
   LOAD CUSTOMIZATION DATA
======================================== */

function loadCustomizationData() {

    customizeBackground =

        localStorage.getItem(

            "customizeBackground"

        ) || "#ffffff";


    customizeFrame =

        localStorage.getItem(

            "customizeFrame"

        ) || "none";


    customizeText =

        localStorage.getItem(

            "customizeText"

        ) || "";


    customizeShowDate =

        localStorage.getItem(

            "customizeShowDate"

        ) === "true";


    /*
        Restore text field.
    */

    const textInput =
        document.getElementById(
            "customText"
        );


    if (textInput) {

        textInput.value =
            customizeText;

    }


    /*
        Restore date checkbox.
    */

    const dateCheckbox =
        document.getElementById(
            "showDate"
        );


    if (dateCheckbox) {

        dateCheckbox.checked =
            customizeShowDate;

    }


    /*
        Restore background button.
    */

    const backgroundButtons =
        document.querySelectorAll(
            ".background-button"
        );


    backgroundButtons.forEach(
        button => {

            button.classList.remove(
                "active"
            );


            if (

                button.dataset.background ===

                customizeBackground

            ) {

                button.classList.add(
                    "active"
                );

            }

        }
    );


    /*
        Restore frame button.
    */

    const frameButtons =
        document.querySelectorAll(
            ".frame-button"
        );


    frameButtons.forEach(
        button => {

            button.classList.remove(
                "active"
            );


            if (

                button.dataset.frame ===

                customizeFrame

            ) {

                button.classList.add(
                    "active"
                );

            }

        }
    );

}


/* ========================================
   DRAW CUSTOMIZE PREVIEW
======================================== */

function drawCustomizePreview() {

    const canvas =
        document.getElementById(
            "customizeCanvas"
        );


    if (!canvas) {

        return;

    }


    /*
        Get saved photos.
    */

    const photos =

        JSON.parse(

            localStorage.getItem(
                "capturedPhotos"
            )

        ) || [];


    const layout =

        localStorage.getItem(
            "selectedLayout"
        ) || "classic";


    const photoCount =

        parseInt(

            localStorage.getItem(
                "selectedPhotoCount"
            )

        ) || 3;


    /*
        Canvas dimensions.
    */

    let width =
        600;

    let height;


    if (
        layout === "classic"
    ) {

        height =
            30 +
            (405 * 3) +
            (20 * 2) +
            90;

    }

    else if (
        layout === "four"
    ) {

        height =
            30 +
            (360 * 4) +
            (18 * 3) +
            90;

    }

    else {

        width =
            700;

        height =
            700;

    }


    canvas.width =
        width;

    canvas.height =
        height;


    const ctx =
        canvas.getContext(
            "2d"
        );


    /*
        Background.
    */

    ctx.fillStyle =
        customizeBackground;


    ctx.fillRect(

        0,

        0,

        width,

        height

    );


    /*
        Draw photos.
    */

    const images = [];


    let loaded =
        0;


    const imagesToLoad =

        Math.min(

            photos.length,

            photoCount

        );


    /*
        Nothing to draw.
    */

    if (
        imagesToLoad === 0
    ) {

        drawCustomizeDecorations(

            ctx,

            width,

            height

        );


        return;

    }


    photos

        .slice(
            0,
            imagesToLoad
        )

        .forEach(

            (src, index) => {

                const image =
                    new Image();


                image.onload =
                    () => {

                        images[index] =
                            image;


                        loaded++;


                        if (
                            loaded ===
                            imagesToLoad
                        ) {

                            drawCustomizePhotos(

                                ctx,

                                images,

                                layout,

                                width,

                                height

                            );


                            drawCustomizeDecorations(

                                ctx,

                                width,

                                height

                            );

                        }

                    };


                image.src =
                    src;

            }

        );

}


/* ========================================
   DRAW CUSTOMIZE PHOTOS
======================================== */

function drawCustomizePhotos(

    ctx,

    images,

    layout,

    width,

    height

) {

    if (
        layout === "classic"
    ) {

        const photoWidth =
            540;

        const photoHeight =
            405;

        const x =
            30;

        const gap =
            20;

        const top =
            30;


        images.forEach(

            (image, index) => {

                drawCoverImage(

                    ctx,

                    image,

                    x,

                    top +
                    index *
                    (
                        photoHeight +
                        gap
                    ),

                    photoWidth,

                    photoHeight

                );

            }

        );

    }


    else if (
        layout === "four"
    ) {

        const photoWidth =
            540;

        const photoHeight =
            360;

        const x =
            30;

        const gap =
            18;

        const top =
            30;


        images.forEach(

            (image, index) => {

                drawCoverImage(

                    ctx,

                    image,

                    x,

                    top +
                    index *
                    (
                        photoHeight +
                        gap
                    ),

                    photoWidth,

                    photoHeight

                );

            }

        );

    }


    else if (
        layout === "grid"
    ) {

        const padding =
            30;

        const gap =
            20;

        const labelHeight =
            80;


        const photoWidth =

            (
                width -
                padding * 2 -
                gap
            ) / 2;


        const photoHeight =

            (
                height -
                padding -
                labelHeight -
                gap
            ) / 2;


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


        images.forEach(

            (image, index) => {

                if (
                    positions[index]
                ) {

                    drawCoverImage(

                        ctx,

                        image,

                        positions[index][0],

                        positions[index][1],

                        photoWidth,

                        photoHeight

                    );

                }

            }

        );

    }

}


/* ========================================
   CUSTOMIZE DECORATIONS
======================================== */

function drawCustomizeDecorations(

    ctx,

    width,

    height

) {

    /*
        SIMPLE FRAME
    */

    if (
        customizeFrame ===
        "simple"
    ) {

        ctx.strokeStyle =
            "#28657d";

        ctx.lineWidth =
            12;


        ctx.strokeRect(

            6,

            6,

            width - 12,

            height - 12

        );

    }


    /*
        ROUNDED FRAME
    */

    else if (
        customizeFrame ===
        "rounded"
    ) {

        ctx.strokeStyle =
            "#28657d";

        ctx.lineWidth =
            12;


        roundRectStroke(

            ctx,

            6,

            6,

            width - 12,

            height - 12,

            30

        );

    }


    /*
        DOUBLE FRAME
    */

    else if (
        customizeFrame ===
        "double"
    ) {

        ctx.strokeStyle =
            "#28657d";

        ctx.lineWidth =
            8;


        ctx.strokeRect(

            6,

            6,

            width - 12,

            height - 12

        );


        ctx.lineWidth =
            3;


        ctx.strokeRect(

            18,

            18,

            width - 36,

            height - 36

        );

    }


    /*
        CUSTOM TEXT
    */

    if (
        customizeText.trim()
            .length > 0
    ) {

        ctx.fillStyle =
            "#28657d";


        ctx.font =
            "bold 28px Arial";


        ctx.textAlign =
            "center";


        ctx.fillText(

            customizeText,

            width / 2,

            height - 55

        );

    }


    /*
        DATE
    */

    if (
        customizeShowDate
    ) {

        ctx.fillStyle =
            "#28657d";


        ctx.font =
            "18px Arial";


        ctx.textAlign =
            "center";


        ctx.fillText(

            getTodayDate(),

            width / 2,

            height - 25

        );

    }

}


/* ========================================
   ROUNDED RECTANGLE STROKE
======================================== */

function roundRectStroke(

    ctx,

    x,

    y,

    width,

    height,

    radius

) {

    ctx.beginPath();


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


    ctx.closePath();


    ctx.stroke();

}

/* ========================================
   FINISH CUSTOMIZATION
======================================== */

function finishCustomization() {

    /*
        Save customization.
    */

    localStorage.setItem(

        "customizeBackground",

        customizeBackground

    );


    localStorage.setItem(

        "customizeFrame",

        customizeFrame

    );


    localStorage.setItem(

        "customizeText",

        customizeText

    );


    localStorage.setItem(

        "customizeShowDate",

        customizeShowDate

    );


    /*
        Go to result page.
    */

   window.location.href =
    "customize.html";

}


/* ========================================
   INITIALIZE CUSTOMIZE PAGE
======================================== */

function initializeCustomizePage() {

    loadCustomizationData();

    drawCustomizePreview();

}


/* ========================================
   RESULT PAGE WITH CUSTOMIZATION
======================================== */

function createCustomizedFinalPhoto() {

    /*
        First create the normal
        final photo using the existing
        result system.
    */

    createFinalPhoto();


    /*
        Customization will be applied
        after the normal canvas is ready.
    */

    setTimeout(

        () => {

            applyCustomizationToFinalCanvas();

        },

        500

    );

}


/* ========================================
   APPLY CUSTOMIZATION TO FINAL CANVAS
======================================== */

function applyCustomizationToFinalCanvas() {

    const canvas =
        document.getElementById(
            "finalCanvas"
        );


    if (!canvas) {

        return;

    }


    const background =

        localStorage.getItem(

            "customizeBackground"

        ) || "#ffffff";


    const frame =

        localStorage.getItem(

            "customizeFrame"

        ) || "none";


    const text =

        localStorage.getItem(

            "customizeText"

        ) || "";


    const showDate =

        localStorage.getItem(

            "customizeShowDate"

        ) === "true";


    /*
        Save existing canvas.
    */

    const original =
        document.createElement(
            "canvas"
        );


    original.width =
        canvas.width;


    original.height =
        canvas.height;


    const originalContext =
        original.getContext(
            "2d"
        );


    originalContext.drawImage(

        canvas,

        0,

        0

    );


    /*
        Background.
    */

    const ctx =
        canvas.getContext(
            "2d"
        );


    ctx.clearRect(

        0,

        0,

        canvas.width,

        canvas.height

    );


    ctx.fillStyle =
        background;


    ctx.fillRect(

        0,

        0,

        canvas.width,

        canvas.height

    );


    /*
        Draw original photo.
    */

    ctx.drawImage(

        original,

        0,

        0

    );


    /*
        Frame.
    */

    if (
        frame === "simple"
    ) {

        ctx.strokeStyle =
            "#28657d";

        ctx.lineWidth =
            12;


        ctx.strokeRect(

            6,

            6,

            canvas.width - 12,

            canvas.height - 12

        );

    }


    else if (
        frame === "rounded"
    ) {

        ctx.strokeStyle =
            "#28657d";

        ctx.lineWidth =
            12;


        roundRectStroke(

            ctx,

            6,

            6,

            canvas.width - 12,

            canvas.height - 12,

            30

        );

    }


    else if (
        frame === "double"
    ) {

        ctx.strokeStyle =
            "#28657d";


        ctx.lineWidth =
            8;


        ctx.strokeRect(

            6,

            6,

            canvas.width - 12,

            canvas.height - 12

        );


        ctx.lineWidth =
            3;


        ctx.strokeRect(

            18,

            18,

            canvas.width - 36,

            canvas.height - 36

        );

    }


    /*
        Custom text.
    */

    if (
        text.trim()
            .length > 0
    ) {

        ctx.fillStyle =
            "#28657d";


        ctx.font =
            "bold 28px Arial";


        ctx.textAlign =
            "center";


        ctx.fillText(

            text,

            canvas.width / 2,

            canvas.height - 55

        );

    }


    /*
        Date.
    */

    if (
        showDate
    ) {

        ctx.fillStyle =
            "#28657d";


        ctx.font =
            "18px Arial";


        ctx.textAlign =
            "center";


        ctx.fillText(

            getTodayDate(),

            canvas.width / 2,

            canvas.height - 25

        );

    }

}


/* ========================================
   UPDATED PAGE INITIALIZATION
======================================== */

document.addEventListener(

    "DOMContentLoaded",

    () => {

        /*
            CUSTOMIZE PAGE
        */

        if (

            document.body.classList

                .contains(

                    "customize-page"

                )

        ) {

            initializeCustomizePage();

        }


        /*
            RESULT PAGE
        */

        if (

            document.body.classList

                .contains(

                    "result-page"

                )

        ) {

            setTimeout(

                () => {

                    applyCustomizationToFinalCanvas();

                },

                700

            );

        }

    }

);

