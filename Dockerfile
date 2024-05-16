FROM node:18-alpine

WORKDIR /usr/src/app

COPY package.json .
COPY package-lock.json .

RUN npm install

COPY . .

EXPOSE 7001

CMD ["npm", "run", "dev"]