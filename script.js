/* ========================================
   PHOTO BOOTH DATA
======================================== */


/* Selected layout */

let selectedLayout =
    localStorage.getItem("selectedLayout") || "classic";


/* Number of photos */

let selectedPhotoCount =
    parseInt(
        localStorage.getItem("selectedPhotoCount")
    ) || 3;


/* Captured photos */

let capturedPhotos =
    JSON.parse(
        localStorage.getItem("capturedPhotos")
    ) || [];


/* Camera */

let cameraStream = null;


/* Current camera */

let currentCamera = "user";


/* Retake index */

let retakeIndex = null;


/* Prevent multiple captures */

let isTakingPhoto = false;


/* Current filter */

let selectedFilter =
    localStorage.getItem("selectedFilter") || "normal";



/* ========================================
   LAYOUT INFORMATION
======================================== */

const layoutNames = {

    classic:
        "Classic 3-Photo Strip",

    four:
        "Four-Photo Strip",

    grid:
        "2 × 2 Photo Grid"

};



/* ========================================
   FILTER INFORMATION
======================================== */

const filterNames = {

    normal:
        "Normal",

    vintage:
        "Vintage",

    bw:
        "Black & White",

    sepia:
        "Sepia",

    cool:
        "Cool",

    warm:
        "Warm"

};



/* ========================================
   FILTER CSS
======================================== */

const filterStyles = {

    normal:
        "none",

    vintage:
        "sepia(0.35) contrast(0.9) brightness(1.05)",

    bw:
        "grayscale(1) contrast(1.1)",

    sepia:
        "sepia(0.8) contrast(0.95)",

    cool:
        "hue-rotate(15deg) saturate(0.9) brightness(1.05)",

    warm:
        "sepia(0.2) saturate(1.3) brightness(1.05)"

};



/* ========================================
   SELECT LAYOUT
======================================== */

function selectLayout(button) {

    const options =
        document.querySelectorAll(
            ".layout-option"
        );


    options.forEach(
        option => {

            option.classList.remove(
                "selected"
            );

        }
    );


    button.classList.add(
        "selected"
    );


    selectedLayout =
        button.dataset.layout;


    selectedPhotoCount =
        parseInt(
            button.dataset.photos
        );


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
   SELECT FILTER
======================================== */

function selectFilter(filter) {

    selectedFilter = filter;


    localStorage.setItem(
        "selectedFilter",
        selectedFilter
    );


    const options =
        document.querySelectorAll(
            ".filter-option"
        );


    options.forEach(
        option => {

            option.classList.remove(
                "active"
            );


            if (
                option.dataset.filter ===
                filter
            ) {

                option.classList.add(
                    "active"
                );

            }

        }
    );


    const video =
        document.getElementById(
            "cameraVideo"
        );


    if (video) {

        applyCameraFilter(
            video
        );

    }

}



/* ========================================
   APPLY CAMERA FILTER
======================================== */

function applyCameraFilter(video) {

    if (!video) {

        return;

    }


    Object.keys(
        filterStyles
    ).forEach(

        filter => {

            video.classList.remove(
                `filter-${filter}`
            );

        }

    );


    video.classList.add(
        `filter-${selectedFilter}`
    );

}



/* ========================================
   START PHOTO BOOTH
======================================== */

function startPhotoBooth() {

    capturedPhotos = [];


    retakeIndex = null;


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
   START / CLOSE CAMERA TOGGLE
======================================== */

async function startCamera() {


    /* ====================================
       IF CAMERA IS ALREADY OPEN,
       CLOSE IT
    ==================================== */

    if (cameraStream) {

        closeCamera();

        return;

    }



    try {


        /* ====================================
           GET CAMERA
        ==================================== */

        cameraStream =
            await navigator
                .mediaDevices
                .getUserMedia({

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



        /* ====================================
           GET ELEMENTS
        ==================================== */

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


        const cameraButton =
            document.getElementById(
                "cameraToggleButton"
            );



        /* ====================================
           SHOW CAMERA
        ==================================== */

        video.srcObject =
            cameraStream;


        video.style.display =
            "block";


        placeholder.style.display =
            "none";


        captureButton.disabled =
            false;



        /* ====================================
           CHANGE BUTTON TEXT
        ==================================== */

        if (cameraButton) {

            cameraButton.textContent =
                "CLOSE CAMERA";

        }



        /* ====================================
           CAMERA DIRECTION
        ==================================== */

        if (
            currentCamera ===
            "environment"
        ) {

            video.classList.add(
                "back-camera"
            );

        }

        else {

            video.classList.remove(
                "back-camera"
            );

        }



        /* ====================================
           APPLY FILTER
        ==================================== */

        applyCameraFilter(
            video
        );


        updateCounter();


    }


    catch (error) {


        console.error(
            "Camera error:",
            error
        );


        cameraStream = null;


        alert(
            "Camera access was blocked. Please allow camera permissions and try again."
        );

    }

}



/* ========================================
   CLOSE CAMERA
======================================== */

function closeCamera() {


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


    const cameraButton =
        document.getElementById(
            "cameraToggleButton"
        );



    /* ====================================
       STOP CAMERA STREAM
    ==================================== */

    if (cameraStream) {


        cameraStream
            .getTracks()
            .forEach(

                track => {

                    track.stop();

                }

            );

    }


    cameraStream = null;



    /* ====================================
       HIDE CAMERA
    ==================================== */

    if (video) {


        video.srcObject = null;


        video.style.display =
            "none";

    }



    /* ====================================
       SHOW PLACEHOLDER
    ==================================== */

    if (placeholder) {


        placeholder.style.display =
            "flex";

    }



    /* ====================================
       DISABLE CAPTURE
    ==================================== */

    if (captureButton) {


        captureButton.disabled =
            true;

    }



    /* ====================================
       CHANGE BUTTON BACK
    ==================================== */

    if (cameraButton) {


        cameraButton.textContent =
            "OPEN CAMERA";

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
        .forEach(

            track => {

                track.stop();

            }

        );


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



    /* If camera is currently open,
       restart with new camera */

    if (cameraStream) {

        closeCamera();

        await wait(100);

        await startCamera();

    }

}



/* ========================================
   UPDATE COUNTER
======================================== */

function updateCounter() {


    const counter =
        document.getElementById(
            "photoCounter"
        );


    if (!counter) {

        return;

    }


    if (
        retakeIndex !== null
    ) {


        counter.textContent =

            `Retaking photo ${
                retakeIndex + 1
            }`;


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

        `Photo ${
            capturedPhotos.length + 1
        } of ${
            selectedPhotoCount
        }`;

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
        !video
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



    isTakingPhoto = true;


    const targetIndex =
        retakeIndex;


    retakeIndex = null;


    updateCounter();


    await runCountdown();


    triggerFlash();


    playShutterSound();


    await wait(150);



    /* ====================================
       CREATE CANVAS
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



    /* ====================================
       APPLY FILTER TO SAVED IMAGE
    ==================================== */

    context.filter =

        filterStyles[
            selectedFilter
        ] || "none";



    /* ====================================
       IMPORTANT MIRROR FIX
    ==================================== */

    context.drawImage(

        video,

        0,

        0,

        canvas.width,

        canvas.height

    );



    context.filter =
        "none";



    /* ====================================
       CREATE PHOTO
    ==================================== */

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


    }

    else {


        capturedPhotos.push(
            photo
        );

    }



    /* ====================================
       SAVE TO LOCAL STORAGE
    ==================================== */

    localStorage.setItem(

        "capturedPhotos",

        JSON.stringify(
            capturedPhotos
        )

    );


    localStorage.setItem(

        "selectedFilter",

        selectedFilter

    );



    /* ====================================
       UPDATE PREVIEW
    ==================================== */

    updatePreview();


    updateCounter();


    isTakingPhoto = false;



    /* ====================================
       ENABLE FINISH
    ==================================== */

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
   COUNTDOWN
======================================== */

function runCountdown() {


    return new Promise(

        resolve => {


            const countdown =
                document.getElementById(
                    "countdown"
                );


            let number = 3;


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


    }

    catch (error) {


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
   UPDATE PHOTO PREVIEW
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



    /* ====================================
       GRID
    ==================================== */

    if (
        selectedLayout ===
        "grid"
    ) {


        strip.classList.add(
            "preview-grid"
        );

    }



    /* ====================================
       CREATE PHOTO SLOTS
    ==================================== */

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

                `Photo ${
                    i + 1
                }`;



            slot.appendChild(
                image
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

        }

        else {


            slot.classList.add(
                "empty"
            );


            slot.textContent =

                `PHOTO ${
                    i + 1
                }`;

        }


        strip.appendChild(
            slot
        );

    }



    /* ====================================
       LABEL
    ==================================== */

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
   RETAKE PHOTO
======================================== */

function retakePhoto(index) {


    if (isTakingPhoto) {

        return;

    }


    retakeIndex =
        index;


    updateCounter();


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

        JSON.stringify(
            capturedPhotos
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


    localStorage.setItem(

        "selectedFilter",

        selectedFilter

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



    selectedFilter =

        localStorage.getItem(
            "selectedFilter"
        ) || "normal";



    /* ====================================
       LAYOUT NAME
    ==================================== */

    const layoutName =
        document.getElementById(
            "resultLayoutName"
        );


    if (layoutName) {


        layoutName.textContent =

            layoutNames[
                selectedLayout
            ] || "Photo Booth";

    }



    /* ====================================
       LOAD IMAGES
    ==================================== */

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
   CLASSIC STRIP
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

        topPadding

        +

        (
            photoHeight * 3
        )

        +

        (
            gap * 2
        )

        +

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

        topPadding

        +

        (
            photoHeight * 4
        )

        +

        (
            gap * 3
        )

        +

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


    const width = 700;


    const height = 700;


    const padding = 30;


    const gap = 20;


    const labelHeight = 80;



    const photoWidth =

        (

            width

            -

            (
                padding * 2
            )

            -

            gap

        )

        /

        2;



    const photoHeight =

        (

            height

            -

            padding

            -

            labelHeight

            -

            gap

        )

        /

        2;



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


    let sourceX = 0;


    let sourceY = 0;



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
            )

            /

            2;

    }

    else {


        sourceHeight =

            image.width /
            boxRatio;


        sourceY =

            (
                image.height -
                sourceHeight
            )

            /

            2;

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
   LABEL
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

        `photo-booth-${
            selectedLayout
        }-${
            selectedFilter
        }.png`;


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


    capturedPhotos = [];


    localStorage.removeItem(
        "capturedPhotos"
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
   COPY TO PRINTER
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
   CLOSE PRINT
======================================== */

function closePrint() {


    const modal =
        document.getElementById(
            "printModal"
        );


    if (modal) {


        modal.classList.remove(
            "active"
        );

    }

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
   PAGE INITIALIZATION
======================================== */

document.addEventListener(

    "DOMContentLoaded",

    () => {


        /* ====================================
           HOME PAGE
        ==================================== */

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



        /* ====================================
           CAPTURE PAGE
        ==================================== */

        if (

            document.body.classList.contains(
                "capture-page"
            )

        ) {


            updatePreview();


            updateCounter();


            selectFilter(
                selectedFilter
            );

        }



        /* ====================================
           RESULT PAGE
        ==================================== */

        if (

            document.body.classList.contains(
                "result-page"
            )

        ) {


            createFinalPhoto();

        }

    }

);
/* ========================================
   STAGE 7
   MOBILE MENU
======================================== */

const menuToggle =
    document.querySelector(
        ".menu-toggle"
    );

const navLinks =
    document.querySelector(
        ".nav-links"
    );


if (
    menuToggle &&
    navLinks
) {

    menuToggle.addEventListener(
        "click",
        function () {

            menuToggle.classList.toggle(
                "active"
            );

            navLinks.classList.toggle(
                "active"
            );

            document.body.classList.toggle(
                "menu-open"
            );

        }
    );


    navLinks
        .querySelectorAll(
            "a"
        )
        .forEach(
            function (link) {

                link.addEventListener(
                    "click",
                    function () {

                        menuToggle.classList.remove(
                            "active"
                        );

                        navLinks.classList.remove(
                            "active"
                        );

                        document.body.classList.remove(
                            "menu-open"
                        );

                    }
                );

            }
        );

}
