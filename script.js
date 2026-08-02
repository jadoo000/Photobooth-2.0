/* ========================================
   PHOTO BOOTH DATA
======================================== */

let selectedLayout =
    localStorage.getItem(
        "selectedLayout"
    )
    || "classic";


let selectedPhotoCount =
    parseInt(
        localStorage.getItem(
            "selectedPhotoCount"
        )
    )
    || 3;


let capturedPhotos =
    JSON.parse(
        localStorage.getItem(
            "capturedPhotos"
        )
    )
    || [];


let cameraStream =
    null;


let currentCamera =
    "user";


let retakeIndex =
    null;


let isTakingPhoto =
    false;



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
   START PHOTO BOOTH
======================================== */

function startPhotoBooth() {

    capturedPhotos = [];


    localStorage.setItem(
        "selectedLayout",
        selectedLayout
    );


    localStorage.setItem(
        "selectedPhotoCount",
        selectedPhotoCount
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
   START CAMERA
======================================== */

async function startCamera() {

    try {

        stopCamera();


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


        video.srcObject =
            cameraStream;


        video.style.display =
            "block";


        placeholder.style.display =
            "none";


        captureButton.disabled =
            false;


        if (
            currentCamera
            === "environment"
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


        updateCounter();

    }

    catch (error) {

        console.error(
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

    if (
        !cameraStream
    ) {

        return;

    }


    cameraStream
        .getTracks()
        .forEach(
            track => {

                track.stop();

            }
        );


    cameraStream =
        null;

}



/* ========================================
   SWITCH CAMERA
======================================== */

async function switchCamera() {

    if (
        isTakingPhoto
    ) {

        return;

    }


    currentCamera =
        currentCamera
        === "user"

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


    if (
        !counter
    ) {

        return;

    }


    if (
        retakeIndex
        !== null
    ) {

        counter.textContent =
            `Retaking photo ${
                retakeIndex + 1
            }`;

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

    if (
        isTakingPhoto
    ) {

        return;

    }


    const video =
        document.getElementById(
            "cameraVideo"
        );


    if (
        !cameraStream
        || video.style.display
            === "none"
    ) {

        alert(
            "Please open the camera first."
        );


        return;

    }


    if (
        retakeIndex
        === null
        &&
        capturedPhotos.length
        >= selectedPhotoCount
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


    /* ================================
       FLASH
    ================================= */

    triggerFlash();


    playShutterSound();


    await wait(
        150
    );


    /* ================================
       CREATE CANVAS
    ================================= */

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
       IMPORTANT:

       The camera preview is mirrored
       using CSS.

       We DO NOT mirror the canvas.

       This means:

       Preview:
       👈 Mirrored selfie view

       Saved photo:
       👉 Normal orientation
    */


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
            0.92
        );



    /* ================================
       SAVE PHOTO
    ================================= */

    if (
        targetIndex
        !== null
    ) {

        capturedPhotos[
            targetIndex
        ] =
            photo;

    }
    else {

        capturedPhotos.push(
            photo
        );

    }


    localStorage.setItem(

        "capturedPhotos",

        JSON.stringify(
            capturedPhotos
        )

    );


    updatePreview();


    updateCounter();


    isTakingPhoto =
        false;


    if (
        capturedPhotos.length
        >= selectedPhotoCount
    ) {

        document
            .getElementById(
                "finishButton"
            )
            .disabled =
                false;

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


            let number =
                3;


            countdown.textContent =
                number;


            const timer =
                setInterval(
                    () => {

                        number--;


                        if (
                            number
                            <= 0
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


    if (
        !flash
    ) {

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
            window.AudioContext
            ||
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
                audioContext
                    .currentTime
            );


        oscillator.frequency
            .exponentialRampToValueAtTime(
                150,
                audioContext
                    .currentTime
                    + 0.12
            );


        gain.gain
            .setValueAtTime(
                0.3,
                audioContext
                    .currentTime
            );


        gain.gain
            .exponentialRampToValueAtTime(
                0.01,
                audioContext
                    .currentTime
                    + 0.12
            );


        oscillator.connect(
            gain
        );


        gain.connect(
            audioContext.destination
        );


        oscillator.start();


        oscillator.stop(
            audioContext
                .currentTime
                + 0.12
        );

    }

    catch (
        error
    ) {

        console.log(
            "Shutter sound unavailable."
        );

    }

}



/* ========================================
   WAIT
======================================== */

function wait(
    milliseconds
) {

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


    if (
        !preview
    ) {

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



    /* ================================
       CREATE PHOTO SLOTS
    ================================= */

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

                    retakePhoto(
                        i
                    );

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



    /* ================================
       LABEL
    ================================= */

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

function retakePhoto(
    index
) {

    if (
        isTakingPhoto
    ) {

        return;

    }


    retakeIndex =
        index;


    updateCounter();


    window.scrollTo({

        top: 0,

        behavior:
            "smooth"

    });

}



/* ========================================
   FINISH
======================================== */

function finishPhotos() {

    if (
        capturedPhotos.length
        < selectedPhotoCount
    ) {

        return;

    }


    localStorage.setItem(

        "capturedPhotos",

        JSON.stringify(
            capturedPhotos
        )

    );


    stopCamera();


    window.location.href =
        "result.html";

}



/* ========================================
   DOWNLOAD
======================================== */

function downloadPhoto() {

    const canvas =
        document.getElementById(
            "finalCanvas"
        );


    if (
        !canvas
    ) {

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
   RETAKE ALL
======================================== */

function retakePhotos() {

    capturedPhotos =
        [];


    localStorage.removeItem(
        "capturedPhotos"
    );


    window.location.href =
        "capture.html";

}



/* ========================================
   PRINT
======================================== */

function printPhoto() {

    const modal =
        document.getElementById(
            "printModal"
        );


    if (
        !modal
    ) {

        return;

    }


    modal.classList.add(
        "active"
    );


    copyCanvasToPrinter();

}



/* ========================================
   CLOSE PRINT
======================================== */

function closePrint() {

    const modal =
        document.getElementById(
            "printModal"
        );


    if (
        modal
    ) {

        modal.classList.remove(
            "active"
        );

    }

}



/* ========================================
   PAGE INITIALIZATION
======================================== */

document.addEventListener(

    "DOMContentLoaded",

    () => {


        /* ============================
           HOME
        ============================ */

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

            }
        );



        /* ============================
           CAPTURE PAGE
        ============================ */

        if (
            document.body.classList
                .contains(
                    "capture-page"
                )
        ) {

            updatePreview();


            updateCounter();

        }



        /* ============================
           RESULT PAGE
        ============================ */

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
