FROM node:18.20.3-alpine3.20
ADD . /todo
WORKDIR /todo

RUN npm install -g localtunnel
