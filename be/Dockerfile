# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /be

COPY package*.json ./
RUN npm ci

COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY src ./src

RUN npm run build
RUN test -f dist/main.js

# Stage 2: Production
FROM node:22-alpine

WORKDIR /be
ENV NODE_ENV=production

COPY --from=builder /be/package*.json ./
COPY --from=builder /be/node_modules ./node_modules
COPY --from=builder /be/dist ./dist

EXPOSE 10000

CMD ["node", "dist/main.js"]