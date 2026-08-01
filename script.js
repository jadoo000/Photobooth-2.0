/* ========================================
   RESET
======================================== */

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}


body {
    min-height: 100vh;

    font-family:
        "Trebuchet MS",
        "Arial",
        sans-serif;

    color: #173b52;

    background:
        linear-gradient(
            180deg,
            #8fd8f5 0%,
            #c8edfa 45%,
            #f5fbfc 100%
        );

    overflow-x: hidden;
}



/* ========================================
   CLOUD EFFECT
======================================== */

body::before,
body::after {
    content: "";

    position: fixed;

    width: 320px;
    height: 100px;

    background: rgba(255,255,255,0.65);

    border-radius: 100px;

    filter: blur(8px);

    z-index: -1;
}


body::before {
    top: 12%;
    left: -100px;
}


body::after {
    bottom: 15%;
    right: -100px;
}



/* ========================================
   HOME PAGE
======================================== */

.home-page,
.capture-page,
.result-page {
    display: flex;

    justify-content: center;

    min-height: 100vh;
}


.home-container {
    width: 100%;

    max-width: 1100px;

    padding: 50px 25px 70px;

    display: flex;

    flex-direction: column;

    align-items: center;
}



/* ========================================
   HEADER
======================================== */

.site-header {
    text-align: center;

    margin-bottom: 55px;
}


.site-header h1 {
    font-size: clamp(3rem, 10vw, 7rem);

    letter-spacing: 8px;

    font-weight: 900;

    color: white;

    text-shadow:
        4px 4px 0 #4f9bb8,
        7px 7px 0 rgba(255,255,255,0.4);
}


.site-header p {
    margin-top: 12px;

    font-size: 1rem;

    letter-spacing: 3px;

    text-transform: uppercase;

    color: #326d86;
}



/* ========================================
   LAYOUT SECTION
======================================== */

.layout-section {
    width: 100%;

    text-align: center;
}


.layout-section h2 {
    margin-bottom: 30px;

    font-size: 2rem;

    color: white;

    text-shadow:
        2px 2px 0 #4f9bb8;
}


.layout-grid {
    display: grid;

    grid-template-columns:
        repeat(
            auto-fit,
            minmax(190px, 1fr)
        );

    gap: 25px;

    width: 100%;

    max-width: 850px;

    margin: auto;
}



/* ========================================
   LAYOUT OPTIONS
======================================== */

.layout-option {
    border: 4px solid transparent;

    border-radius: 25px;

    padding: 25px 20px;

    background:
        rgba(255,255,255,0.65);

    backdrop-filter: blur(10px);

    cursor: pointer;

    transition:
        transform 0.25s ease,
        border 0.25s ease,
        box-shadow 0.25s ease;
}


.layout-option:hover {
    transform: translateY(-7px);

    box-shadow:
        0 15px 30px
        rgba(40,100,130,0.2);
}


.layout-option.selected {
    border-color: white;

    box-shadow:
        0 0 0 4px #58aeca,
        0 15px 35px
        rgba(40,100,130,0.3);

    transform: translateY(-7px);
}


.layout-option span {
    display: block;

    margin-top: 20px;

    font-weight: bold;

    color: #28657d;
}



/* ========================================
   MINI PHOTO STRIPS
======================================== */

.mini-strip {
    width: 110px;

    margin: auto;

    padding: 8px;

    background: white;

    box-shadow:
        0 7px 15px
        rgba(0,0,0,0.15);
}


.mini-photo {
    display: flex;

    align-items: center;

    justify-content: center;

    background: #b7dce9;

    color: white;

    font-size: 12px;

    font-weight: bold;
}


.classic-strip .mini-photo {
    height: 70px;

    margin-bottom: 5px;
}


.four-strip .mini-photo {
    height: 50px;

    margin-bottom: 5px;
}


.mini-label {
    padding: 8px 2px 4px;

    font-size: 7px;

    letter-spacing: 1px;

    color: #28657d;
}



/* ========================================
   GRID LAYOUT
======================================== */

.mini-grid {
    width: 140px;

    margin: auto;

    padding: 8px;

    display: grid;

    grid-template-columns:
        1fr 1fr;

    gap: 5px;

    background: white;

    box-shadow:
        0 7px 15px
        rgba(0,0,0,0.15);
}


.mini-grid .mini-photo {
    height: 65px;
}



/* ========================================
   BUTTONS
======================================== */

.main-button {
    margin-top: 45px;

    padding: 18px 50px;

    border: none;

    border-radius: 50px;

    background: white;

    color: #28708b;

    font-size: 1rem;

    font-weight: 900;

    letter-spacing: 2px;

    cursor: pointer;

    box-shadow:
        0 8px 20px
        rgba(30,100,130,0.2);

    transition:
        transform 0.2s ease,
        box-shadow 0.2s ease;
}


.main-button:hover {
    transform: translateY(-4px);

    box-shadow:
        0 12px 25px
        rgba(30,100,130,0.3);
}


.main-button:disabled {
    opacity: 0.5;

    cursor: not-allowed;

    transform: none;
}


.secondary-button {
    padding: 12px 20px;

    border: 2px solid white;

    border-radius: 30px;

    background:
        rgba(255,255,255,0.5);

    color: #28657d;

    font-weight: bold;

    cursor: pointer;

    transition: 0.2s;
}


.secondary-button:hover {
    background: white;
}



/* ========================================
   CAPTURE PAGE
======================================== */

.capture-container {
    width: 100%;

    max-width: 1200px;

    padding: 30px 25px 60px;

    display: flex;

    flex-direction: column;

    align-items: center;
}


.capture-header {
    text-align: center;

    position: relative;

    width: 100%;

    margin-bottom: 30px;
}


.capture-header h1,
.result-header h1 {
    color: white;

    font-size: 3rem;

    letter-spacing: 5px;

    text-shadow:
        3px 3px 0 #4f9bb8;
}


.capture-header p {
    margin-top: 8px;

    color: #28657d;

    font-weight: bold;
}


.back-button {
    position: absolute;

    left: 0;

    top: 10px;

    border: none;

    background: white;

    padding: 10px 18px;

    border-radius: 25px;

    color: #28657d;

    cursor: pointer;

    font-weight: bold;
}



/* ========================================
   CAMERA LAYOUT
======================================== */

.camera-layout {
    width: 100%;

    display: grid;

    grid-template-columns:
        1fr 300px;

    gap: 35px;

    align-items: start;
}


.camera-section {
    width: 100%;
}


.camera-frame {
    width: 100%;

    aspect-ratio: 4 / 3;

    background:
        rgba(255,255,255,0.55);

    border:
        8px solid white;

    border-radius: 30px;

    overflow: hidden;

    position: relative;

    box-shadow:
        0 15px 35px
        rgba(30,100,130,0.2);
}


.camera-placeholder {
    height: 100%;

    display: flex;

    flex-direction: column;

    align-items: center;

    justify-content: center;

    color: #5793a9;
}


.camera-icon {
    font-size: 5rem;

    margin-bottom: 15px;
}


#cameraVideo {
    width: 100%;

    height: 100%;

    object-fit: cover;
}


.countdown {
    position: absolute;

    inset: 0;

    display: flex;

    align-items: center;

    justify-content: center;

    font-size: 10rem;

    font-weight: bold;

    color: white;

    text-shadow:
        0 5px 20px
        rgba(0,0,0,0.4);

    pointer-events: none;
}


.camera-controls {
    display: flex;

    justify-content: center;

    align-items: center;

    gap: 20px;

    margin-top: 25px;
}


.shutter-button {
    width: 80px;

    height: 80px;

    border-radius: 50%;

    border: 8px solid white;

    background: #62b5d2;

    cursor: pointer;

    box-shadow:
        0 5px 15px
        rgba(0,0,0,0.2);

    transition: transform 0.2s;
}


.shutter-button:hover {
    transform: scale(1.1);
}


.shutter-button span {
    display: block;

    width: 45px;

    height: 45px;

    margin: auto;

    background: white;

    border-radius: 50%;
}



/* ========================================
   PHOTO PREVIEW
======================================== */

.preview-section {
    text-align: center;
}


.preview-section h2 {
    color: white;

    margin-bottom: 20px;
}


.photo-preview {
    min-height: 300px;

    padding: 15px;

    background: white;

    border-radius: 10px;

    box-shadow:
        0 15px 30px
        rgba(0,0,0,0.15);
}


.preview-placeholder {
    height: 270px;

    display: flex;

    align-items: center;

    justify-content: center;

    color: #8ab5c4;

    font-size: 0.9rem;
}



/* ========================================
   RESULT PAGE
======================================== */

.result-container {
    width: 100%;

    max-width: 900px;

    padding: 50px 25px;

    text-align: center;
}


.result-header {
    margin-bottom: 40px;
}


.result-header p {
    margin-top: 10px;

    color: #28657d;
}


.result-content {
    display: flex;

    flex-direction: column;

    align-items: center;
}


.final-photo-container {
    padding: 15px;

    background: white;

    box-shadow:
        0 15px 35px
        rgba(30,100,130,0.25);
}


#finalCanvas {
    display: block;

    max-width: 100%;

    width: 300px;

    height: auto;
}


.result-actions {
    display: flex;

    flex-wrap: wrap;

    justify-content: center;

    gap: 15px;

    margin-top: 35px;
}


.result-actions .main-button {
    margin-top: 0;
}



/* ========================================
   PRINT MODAL
======================================== */

.print-modal {
    position: fixed;

    inset: 0;

    background:
        rgba(20,60,80,0.7);

    display: none;

    align-items: center;

    justify-content: center;

    padding: 20px;

    z-index: 100;
}


.print-modal.active {
    display: flex;
}


.printer-container {
    width: 100%;

    max-width: 500px;

    padding: 35px;

    border-radius: 30px;

    background:
        #eaf7fa;

    text-align: center;

    position: relative;
}


.close-print {
    position: absolute;

    right: 20px;

    top: 15px;

    border: none;

    background: none;

    font-size: 2rem;

    color: #28657d;

    cursor: pointer;
}


.printer-container h2 {
    margin-bottom: 20px;

    color: #28657d;
}


.printer-screen {
    padding: 12px;

    margin-bottom: 20px;

    background: #173b52;

    color: #a9e8ff;

    border-radius: 8px;

    font-family: monospace;
}


.printer {
    width: 280px;

    margin: auto;
}


.printer-top {
    height: 70px;

    border-radius: 20px 20px 5px 5px;

    background: #d2e8ed;

    position: relative;
}


.printer-light {
    width: 12px;

    height: 12px;

    border-radius: 50%;

    background: #62b5d2;

    position: absolute;

    top: 20px;

    right: 25px;
}


.printer-slot {
    height: 40px;

    background: #a8c7cf;

    overflow: hidden;

    position: relative;
}


.printed-photo {
    position: absolute;

    width: 150px;

    left: 65px;

    top: -400px;

    background: white;

    padding: 8px;

}


.printed-photo canvas {
    width: 100%;

    display: block;
}


.printing {
    animation:
        printOut 5s ease-in-out forwards;
}


@keyframes printOut {

    0% {
        top: -400px;
    }

    100% {
        top: 0;
    }

}



/* ========================================
   MOBILE
======================================== */

@media (max-width: 800px) {

    .camera-layout {
        grid-template-columns: 1fr;
    }


    .preview-section {
        width: 100%;
    }


    .photo-preview {
        max-width: 300px;

        margin: auto;
    }


    .back-button {
        position: static;

        margin-bottom: 15px;
    }


    .capture-header {
        display: flex;

        flex-direction: column;

        align-items: center;
    }

}


@media (max-width: 500px) {

    .site-header h1 {
        font-size: 2.8rem;

        letter-spacing: 4px;
    }


    .capture-header h1,
    .result-header h1 {
        font-size: 2rem;
    }


    .camera-controls {
        flex-wrap: wrap;
    }


    .secondary-button {
        font-size: 0.75rem;
    }


    .printer {
        transform: scale(0.85);
    }

  }
