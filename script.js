/* ========================================
   PHOTO BOOTH GLOBAL DATA
======================================== */

let selectedLayout =
    localStorage.getItem("selectedLayout")
    || "classic";


let selectedPhotoCount =
    parseInt(
        localStorage.getItem("selectedPhotoCount")
    )
    || 3;


let capturedPhotos = [];

let cameraStream = null;

let currentCamera = "user";



/* ========================================
   LAYOUT SELECTION
======================================== */

function selectLayout(button) {

    const options =
        document.querySelectorAll(
            ".layout-option"
        );


    options.forEach(option => {

        option.classList.remove(
            "selected"
        );

    });


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
   START PHOTO BOOTH
======================================== */

function startPhotoBooth() {

    localStorage.setItem(
        "selectedLayout",
        selectedLayout
    );


    localStorage.setItem(
        "selectedPhotoCount",
        selectedPhotoCount
    );


    window.location.href =
        "capture.html";

}



/* ========================================
   GO BACK HOME
======================================== */

function goBackHome() {

    stopCamera();

    window.location.href =
        "index.html";

}



/* ========================================
   CAMERA
======================================== */

async function startCamera() {

    try {

        if (cameraStream) {

            stopCamera();

        }


        cameraStream =
            await navigator.mediaDevices
                .getUserMedia({

                    video: {

                        facingMode:
                            currentCamera

                    },

                    audio: false

                });


        const video =
            document.getElementById(
                "cameraVideo"
            );


        const placeholder =
            document.querySelector(
                ".camera-placeholder"
            );


        video.srcObject =
            cameraStream;


        video.hidden =
            false;


        placeholder.style.display =
            "none";


        updateCounter();

    }

    catch (error) {

        console.error(
            "Camera error:",
            error
        );


        alert(
            "Unable to access your camera. Please allow camera permissions and try again."
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
        .forEach(
            track =>
                track.stop()
        );


    cameraStream =
        null;

}



/* ========================================
   SWITCH CAMERA
======================================== */

async function switchCamera() {

    currentCamera =
        currentCamera === "user"
            ? "environment"
            : "user";


    await startCamera();

}



/* ========================================
   PHOTO COUNTER
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
        capturedPhotos.length
        >= selectedPhotoCount
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

    const video =
        document.getElementById(
            "cameraVideo"
        );


    if (
        !video
        || video.hidden
    ) {

        alert(
            "Please open the camera first."
        );

        return;

    }


    if (
        capturedPhotos.length
        >= selectedPhotoCount
    ) {

        return;

    }


    await runCountdown();


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


    context.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
    );


    const photo =
        canvas.toDataURL(
            "image/jpeg",
            0.9
        );


    capturedPhotos.push(
        photo
    );


    localStorage.setItem(
        "capturedPhotos",
        JSON.stringify(
            capturedPhotos
        )
    );


    updatePreview();

    updateCounter();


    if (
        capturedPhotos.length
        >= selectedPhotoCount
    ) {

        document
            .getElementById(
                "finishButton"
            )
            .disabled = false;

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
                                400
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
   PHOTO PREVIEW
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


    capturedPhotos.forEach(
        (photo, index) => {

            const image =
                document.createElement(
                    "img"
                );


            image.src =
                photo;


            image.alt =
                `Photo ${
                    index + 1
                }`;


            image.style.width =
                "100%";


            image.style.display =
                "block";


            image.style.marginBottom =
                "8px";


            preview.appendChild(
                image
            );

        }
    );

}



/* ========================================
   FINISH PHOTOS
======================================== */

function finishPhotos() {

    if (
        capturedPhotos.length
        < selectedPhotoCount
    ) {

        return;

    }


    stopCamera();


    window.location.href =
        "result.html";

}



/* ========================================
   RESULT PAGE
======================================== */

function createFinalPhoto() {

    const canvas =
        document.getElementById(
            "finalCanvas"
        );


    if (!canvas) {

        return;

    }


    const photos =
        JSON.parse(
            localStorage.getItem(
                "capturedPhotos"
            )
        )
        || [];


    if (!photos.length) {

        return;

    }


    const images = [];


    let loaded =
        0;


    photos.forEach(
        (src, index) => {

            const image =
                new Image();


            image.onload =
                () => {

                    loaded++;


                    if (
                        loaded
                        === photos.length
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
   DRAW PHOTO STRIP
======================================== */

function drawFinalCanvas(
    canvas,
    images
) {

    const width =
        600;


    const photoHeight =
        450;


    const padding =
        30;


    const labelHeight =
        80;


    canvas.width =
        width;


    canvas.height =
        (
            photoHeight
            * images.length
        )
        + padding * 2
        + labelHeight;


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


    images.forEach(
        (image, index) => {

            const y =
                padding
                + (
                    index
                    * photoHeight
                );


            ctx.drawImage(
                image,
                padding,
                y,
                width
                - padding * 2,
                photoHeight
            );

        }
    );


    ctx.fillStyle =
        "#28657d";


    ctx.font =
        "bold 24px Arial";


    ctx.textAlign =
        "center";


    ctx.fillText(
        "PHOTO BOOTH",
        width / 2,
        canvas.height - 30
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
        "my-photo-booth.png";


    link.href =
        canvas.toDataURL(
            "image/png"
        );


    link.click();

}



/* ========================================
   RETAKE
======================================== */

function retakePhotos() {

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
   COPY PHOTO TO PRINTER
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
        !original
        || !printerCanvas
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


        /* Load selected layout */

        const layoutOptions =
            document.querySelectorAll(
                ".layout-option"
            );


        layoutOptions.forEach(
            option => {

                if (
                    option.dataset.layout
                    === selectedLayout
                ) {

                    option.classList.add(
                        "selected"
                    );

                }
                else {

                    option.classList.remove(
                        "selected"
                    );

                }

            }
        );



        /* Capture page */

        if (
            document.body.classList.contains(
                "capture-page"
            )
        ) {

            capturedPhotos =
                JSON.parse(
                    localStorage.getItem(
                        "capturedPhotos"
                    )
                )
                || [];


            updateCounter();

            updatePreview();

        }



        /* Result page */

        if (
            document.body.classList.contains(
                "result-page"
            )
        ) {

            createFinalPhoto();

        }

    }
);
