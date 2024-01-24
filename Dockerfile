FROM node:latest

COPY ./ /app
WORKDIR /app
RUN npm run build
WORKDIR /app/dist

ENTRYPOINT node main.js
