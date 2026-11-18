FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY src ./src

EXPOSE 3001

CMD ["npm", "run", "start:prod"]