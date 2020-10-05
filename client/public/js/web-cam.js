import * as processCanvas from "../wasm/process_canvas.js";
import * as util from "./util.js";

const SQUARE_SIZES = [4, 8, 16, 32];

export class WebCam {
  videoWidth = 640;
  videoHeight = 0;
  isStreaming = false;
  videoId = "web-cam_video";
  sourceCanvasId = "web-cam__source";
  targetCanvasId = "web-cam__target";
  stopped = false;

  intervalHandle = null;

  squareSize = SQUARE_SIZES[2];
  transformation = processCanvas.Transformation.Pixelate;

  constructor(appDiv) {
    const video = util.videoNode({
      id: this.videoId,
      classes: "web-cam__video hidden"
    });
    const sourceCanvas = util.canvasNode({
      id: this.sourceCanvasId,
      classes: "web-cam__canvas hidden"
    });
    const targetCanvas = util.canvasNode({
      id: this.targetCanvasId,
      classes: "web-cam__canvas"
    });

    appDiv.appendChild(video);
    appDiv.appendChild(sourceCanvas);
    appDiv.appendChild(targetCanvas);
  }

  async start() {
    const video = document.getElementById(this.videoId);
    const sourceCanvas = document.getElementById(this.sourceCanvasId);
    const targetCanvas = document.getElementById(this.targetCanvasId);

    await this._initializeVideoStream(video, sourceCanvas, targetCanvas);

    const doTakeFrame = () => {
      this._takeFrame(video, sourceCanvas, targetCanvas);
      window.requestAnimationFrame(doTakeFrame);
    };

    window.requestAnimationFrame(doTakeFrame);
  }

  stop() {
    this.stopped = true;
  }

  setTransformation(transformation) {
    switch (transformation) {
      case "pixelate":
        this.transformation = processCanvas.Transformation.Pixelate;
        break;
      case "greyscale":
        this.transformation = processCanvas.Transformation.Greyscale;
        break;
      default:
        this.transformation = processCanvas.Transformation.Unknown;
    }
  }

  setSquareSize(size) {
    if (!SQUARE_SIZES.includes(size)) {
      console.warn(`Must be one of ${SQUARE_SIZES.join()}`);
      return;
    }

    this.squareSize = size;
  }

  async _initializeVideoStream(video, sourceCanvas, targetCanvas) {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false
    });

    video.srcObject = stream;
    video.play();

    return new Promise(resolve => {
      video.addEventListener(
        "canplay",
        () => {
          if (this.isStreaming) {
            return;
          }

          this.videoHeight =
            video.videoHeight / (video.videoWidth / this.videoWidth);

          video.setAttribute("width", this.videoWidth);
          video.setAttribute("height", this.videoHeight);
          sourceCanvas.setAttribute("width", this.videoWidth);
          sourceCanvas.setAttribute("height", this.videoHeight);
          targetCanvas.setAttribute("width", this.videoWidth);
          targetCanvas.setAttribute("height", this.videoHeight);

          this.isStreaming = true;

          this._clearFrame(targetCanvas);

          resolve();
        },
        false
      );
    });
  }

  _clearFrame(canvas) {
    var context = canvas.getContext("2d");
    context.fillStyle = "#000";
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  _takeFrame(video, sourceCanvas, targetCanvas) {
    if (!this.videoWidth || !this.videoHeight) {
      this._clearFrame(sourceCanvas);
    }

    sourceCanvas.width = this.videoWidth;
    sourceCanvas.height = this.videoHeight;

    const sourceCtx = sourceCanvas.getContext("2d");
    sourceCtx.drawImage(video, 0, 0, this.videoWidth, this.videoHeight);
    const targetCtx = targetCanvas.getContext("2d");

    processCanvas.transform(
      sourceCtx,
      targetCtx,
      this.videoWidth,
      this.videoHeight,
      this.squareSize,
      this.transformation
    );
  }
}
