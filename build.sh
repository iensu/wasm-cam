#!/bin/bash

set -ex

rm -rf client/public/wasm

cd wasm/process-canvas/
wasm-pack build --release --target web --out-dir ../../client/public/wasm
cd -
