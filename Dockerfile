FROM rust:1.47-slim

RUN apt-get update -yq \
  && apt-get install curl gnupg pkg-config libssl-dev -yq \
  && curl -sL https://deb.nodesource.com/setup_12.x | bash \
  && apt-get install nodejs -yq \
  && cargo install wasm-pack

WORKDIR /app

COPY ./client ./client
COPY ./server ./server
COPY ./wasm ./wasm
COPY ./build.sh ./build.sh

RUN /app/build.sh

ENTRYPOINT ["node", "./server/index.js"]
