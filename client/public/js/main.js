"use strict";

window.WebCam = {
  run
};

function run(modifyFn) {
  var width = 640;
  var height = 0;
  var intervalHandle = null;
  var streaming = false;

  var video = null;
  var canvas = null;
  var photo = null;
  var startbutton = null;

  function startup() {
    video = $("#video");
    canvas = $("#canvas");
    photo = $("#photo");

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
          console.log("Video width", video.videoWidth);
          height = video.videoHeight / (video.videoWidth / width);

          video.setAttribute("width", width);
          video.setAttribute("height", height);
          canvas.setAttribute("width", width);
          canvas.setAttribute("height", height);

          streaming = true;
        }
      },
      false
    );

    clearPhoto();
  }

  function clearPhoto() {
    var context = canvas.getContext("2d");
    context.fillStyle = "#AAA";
    context.fillRect(0, 0, canvas.width, canvas.height);

    var data = canvas.toDataURL("image/png");
    photo.setAttribute("src", data);
  }

  function takePicture() {
    var context = canvas.getContext("2d");

    if (width && height) {
      canvas.width = width;
      canvas.height = height;
      context.drawImage(video, 0, 0, width, height);

      var imageData = context.getImageData(0, 0, width, height);
      var updatedImageData = context.createImageData(width, height);

      var updatedData = modifyFn(imageData, 16, "greyscale");

      updatedData.forEach((val, idx) => {
        updatedImageData.data[idx] = val;
      });

      context.putImageData(updatedImageData, 0, 0);

      var data = canvas.toDataURL("image/png");

      photo.setAttribute("src", data);
    } else {
      clearPhoto();
    }
  }

  $("#photo").on("click", () => {
    if (!intervalHandle) {
      takePicture();
      intervalHandle = setInterval(takePicture, 1000 / 120);
    } else {
      clearInterval(intervalHandle);
      intervalHandle = null;
    }
  });

  startup();
}
