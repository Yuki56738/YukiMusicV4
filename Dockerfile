FROM node:latest

COPY ./ /app

WORKDIR /app/dist

ENTRYPOINT node main.js