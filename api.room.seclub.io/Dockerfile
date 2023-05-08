FROM node:18-alpine

WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

RUN npm run build

RUN chmod +x entrypoint.sh
ENTRYPOINT ["./entrypoint.sh"]