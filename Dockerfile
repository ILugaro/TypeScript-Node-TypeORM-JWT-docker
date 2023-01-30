FROM node:18

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

RUN npm run build

COPY .env ./built
WORKDIR ./built

EXPOSE 4000

CMD node app.js