# WASM-Cam

Playing around with the web-cam using WASM.

In this version the WASM code only receives and returns an array of bytes and does not access any DOM elements directly.

## Run the app

1. ./build.sh
2. ./start.sh
3. Navigate to http://localhost:8080

You can modify the wasm-cam configuration from the browser console with the following methods:

- `webCam.setSquareSize(size: number)` Changes the size of each pixel square, can be 4, 8, 16 or 32
- `webCam.setTransformation(transform: string)` Changes the transform, can be `pixelate`, `greyscale` or `indentity` which leaves the picture unmodified.
