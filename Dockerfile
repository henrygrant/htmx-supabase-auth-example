FROM node:lts-alpine
RUN apk add --update python3 py3-pip make g++
WORKDIR /usr/app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE $PORT
CMD ["npm", "start"]
