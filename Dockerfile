FROM node:12-slim

WORKDIR /app

COPY ./public ./public
COPY ./server ./server

ENTRYPOINT ["node", "./server/index.js"]
