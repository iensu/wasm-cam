"use strict";

window.WebCam = {
  run
};

function run(modifyFn, transformType) {
  let width = 640;
  let height = 0;
  let intervalHandle = null;
  let streaming = false;

  let video = null;
  let sourceCanvas = null;
  let targetCanvas = null;

  function startup() {
    video = $("#video");
    sourceCanvas = $("#source-canvas");
    targetCanvas = $("#target-canvas");

    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: false
      })
      .then(stream => {
        video.srcObject = stream;
        video.play();
      })
      .catch(err => {
        console.error("Error occurred", err);
      });

    video.addEventListener(
      "canplay",
      () => {
        if (!streaming) {
          height = video.videoHeight / (video.videoWidth / width);

          video.setAttribute("width", width);
          video.setAttribute("height", height);
          sourceCanvas.setAttribute("width", width);
          sourceCanvas.setAttribute("width", width);
          targetCanvas.setAttribute("width", width);
          targetCanvas.setAttribute("height", height);

          streaming = true;
        }
      },
      false
    );

    clearFrame();
  }

  function clearFrame() {
    var context = targetCanvas.getContext("2d");
    context.fillStyle = "#000";
    context.fillRect(0, 0, targetCanvas.width, targetCanvas.height);
  }

  function takeFrame() {
    var context = sourceCanvas.getContext("2d");

    if (width && height) {
      sourceCanvas.width = width;
      sourceCanvas.height = height;
      context.drawImage(video, 0, 0, width, height);

      var imageData = context.getImageData(0, 0, width, height);
      var updatedImageData = context.createImageData(width, height);

      var updatedData = modifyFn(
        imageData.data,
        imageData.width,
        imageData.height,
        8,
        transformType
      );

      updatedData.forEach((val, idx) => {
        updatedImageData.data[idx] = val;
      });

      targetCanvas.getContext("2d").putImageData(updatedImageData, 0, 0);
    } else {
      clearFrame();
    }
  }

  $("#target-canvas").on("click", () => {
    if (!intervalHandle) {
      takeFrame();
      intervalHandle = setInterval(takeFrame, 1000 / 120);
    } else {
      clearInterval(intervalHandle);
      intervalHandle = null;
    }
  });

  startup();
}
