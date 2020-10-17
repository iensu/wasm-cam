"use strict";

function modifySquares(squareWidth, fn, imageData, updatedData) {
  const { width, height } = imageData;

  const numSquares = (width * height) / squareWidth ** 2;

  for (let sq = 0; sq < numSquares; sq++) {
    const pixelIndices = getSquarePixelIndices(sq, squareWidth, width);
    const squarePixels = pixelIndices.map(idx => [
      idx,
      [
        imageData.data[idx + 0],
        imageData.data[idx + 1],
        imageData.data[idx + 2],
        imageData.data[idx + 3]
      ]
    ]);

    const updatedSquare = fn(squarePixels);

    updatedSquare.forEach(([index, vals]) => {
      updatedData.data[index + 0] = vals[0];
      updatedData.data[index + 1] = vals[1];
      updatedData.data[index + 2] = vals[2];
      updatedData.data[index + 3] = vals[3];
    });
  }

  return updatedData;
}

function range(start, end, step = 1) {
  const result = [];

  for (let i = start; i < end; i += step) {
    result.push(i);
  }

  return result;
}

function getSquarePixelIndices(squareIdx, squareWidth, width) {
  const squaresPerRow = Math.floor(width / squareWidth);
  const row = Math.floor(squareIdx / squaresPerRow);
  const pixelsPerRow = squareWidth * width;
  const startIdx =
    squareWidth *
    ((squareIdx % squaresPerRow) * squareWidth +
      row * squaresPerRow * squareWidth ** 2);

  let indices = [];

  for (let i = 0; i < squareWidth; i++) {
    const start = startIdx + i * pixelsPerRow;
    const end = start + squareWidth ** 2;

    indices = indices.concat(range(start, end, squareWidth));
  }

  return indices;
}

function App() {
  const baseWidth = 640;
  let squareSize = 8;
  let isStreaming = false;

  function clearFrame(canvasElem, photoElem) {
    const context = canvasElem.getContext("2d");
    context.fillStyle = "#AAA";
    context.fillRect(0, 0, canvasElem.width, canvasElem.height);

    const data = canvasElem.toDataURL("image/png");
    photoElem.setAttribute("src", data);
  }

  function captureFrame(videoElem, canvasElem, photoElem) {
    const context = canvasElem.getContext("2d");
    const { width, height } = videoElem;

    if (width && height) {
      canvasElem.width = width;
      canvasElem.height = height;
      context.drawImage(videoElem, 0, 0, width, height);

      const imageData = context.getImageData(0, 0, width, height);
      const updatedData = context.createImageData(width, height);

      modifySquares(
        squareSize,
        square => {
          const numPixels = square.length;
          const summed = square.reduce(
            ([totR, totG, totB, totA], [_, [r, g, b, a]]) => [
              totR + r,
              totG + g,
              totB + b,
              totA + a
            ],
            [0, 0, 0, 0]
          );

          return square.map(([idx, _]) => [
            idx,
            [
              Math.floor(summed[0] / numPixels),
              Math.floor(summed[1] / numPixels),
              Math.floor(summed[2] / numPixels),
              summed[3] / numPixels
            ]
          ]);

          return square;
        },
        imageData,
        updatedData
      );

      context.putImageData(updatedData, 0, 0);

      const data = canvasElem.toDataURL("image/png");

      photoElem.setAttribute("src", data);
    } else {
      clearFrame(canvasElem, photoElem);
    }
  }

  function _initializeVideoStream(videoElem, canvasElem, photoElem) {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then(stream => {
        videoElem.srcObject = stream;
        videoElem.play();
      })
      .catch(err => {
        console.error("Error occurred", err);
      });

    return new Promise(resolve => {
      videoElem.addEventListener(
        "canplay",
        () => {
          if (!isStreaming) {
            const height =
              videoElem.videoHeight / (videoElem.videoWidth / baseWidth);

            videoElem.setAttribute("width", baseWidth);
            videoElem.setAttribute("height", height);
            canvasElem.setAttribute("width", baseWidth);
            canvasElem.setAttribute("height", height);

            isStreaming = true;

            clearFrame(canvasElem, photoElem);
          }

          resolve();
        },
        false
      );
    });
  }

  async function start() {
    const video = $("#video");
    const canvas = $("#canvas");
    const photo = $("#photo");

    await _initializeVideoStream(video, canvas, photo);

    const doCaptureFrame = () => {
      captureFrame(video, canvas, photo);
      window.requestAnimationFrame(doCaptureFrame);
    };

    window.requestAnimationFrame(doCaptureFrame);
  }

  start();

  return {
    setSquareSize(s) {
      if ([4, 8, 16].includes(s)) {
        squareSize = s;
      } else {
        console.warn("Size must be one of 4, 8 or 16");
      }
    }
  };
}

window.webCam = App();
