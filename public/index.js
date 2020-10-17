"use strict";

function createNode(nodeType, attributes = {}, children = []) {
  const node = document.createElement(nodeType);

  Object.entries(attributes).forEach(([attr, val]) => {
    node[attr] = val;
  });

  children.forEach(child => {
    node.appendChild(child);
  });

  return node;
}

const div = createNode.bind(null, "div");
const p = createNode.bind(null, "p");
const button = createNode.bind(null, "button");
const video = createNode.bind(null, "video");

async function getVideoTrack(constraints, elem) {
  const stream = await navigator.mediaDevices.getUserMedia(constraints);

  elem.srcObject = stream;

  elem.onloadedmetadata = function() {
    elem.play();
  };

  return stream.getVideoTracks()[0];
}

function modifySquares(squareWidth, fn, imageData, updatedData) {
  const pixelWidth = 4;
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

(function() {
  var width = 640; // We will scale the photo width to this
  var height = 0; // This will be computed based on the input stream

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
      .getUserMedia({ video: true, audio: false })
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
      var updatedData = context.createImageData(width, height);

      modifySquares(
        8,
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

      var data = canvas.toDataURL("image/png");

      photo.setAttribute("src", data);
    } else {
      clearPhoto();
    }
  }

  setInterval(takePicture, 200);

  startup();
})();

/*
window.App = {
  run: () => {
    const app = $("#app");<
    const vid = video();

    app.appendChild(
      div({}, [
        vid,
        button({ innerText: "Start" }).on("click", async () => {
          const track = getVideoTrack({ video: true }, vid);
        })
      ])
    );
  }
};
*/

function range(start, end, step = 1) {
  const result = [];

  for (let i = start; i < end; i += step) {
    result.push(i);
  }

  return result;
}

function getSquarePixelIndices(squareIdx, squareWidth, width) {
  const pixelWidth = 4;
  const squaresPerRow = Math.floor(width / squareWidth);
  const row = Math.floor(squareIdx / squaresPerRow);
  const pixelsPerRow = pixelWidth * width;
  const startIdx =
    pixelWidth *
    ((squareIdx % squaresPerRow) * squareWidth +
      row * squaresPerRow * squareWidth ** 2);

  let indices = [];

  for (let i = 0; i < squareWidth; i++) {
    const start = startIdx + i * pixelsPerRow;
    const end = start + pixelWidth * squareWidth;

    indices = indices.concat(range(start, end, pixelWidth));
  }

  return indices;
}

(function testCanvas() {
  const canvas = $("#canvas2");
  const { width, height } = canvas;

  const ctx = canvas.getContext("2d");

  const imageData = ctx.getImageData(0, 0, width, height);
  const updatedData = ctx.createImageData(imageData.width, imageData.height);
  const squareWidth = 8;
  let squares = [];

  const numSquares = (width * height) / squareWidth ** 2;

  for (let sq = 0; sq < numSquares; sq++) {
    const [r, g, b, a] = [
      Math.floor(sq * 5),
      Math.floor(sq * 10),
      Math.floor(sq * 15),
      255
    ];

    const pixelIndices = getSquarePixelIndices(sq, squareWidth, width);

    squares.push(pixelIndices);

    pixelIndices.forEach(idx => {
      updatedData.data[idx + 0] = r;
      updatedData.data[idx + 1] = g;
      updatedData.data[idx + 2] = b;
      updatedData.data[idx + 3] = a;
    });
  }

  ctx.putImageData(updatedData, 0, 0);
})();
