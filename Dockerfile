# syntax=docker/dockerfile:1

FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN --mount=type=secret,id=npm_token \
    echo "@it-daily-store:registry=https://npm.pkg.github.com" > .npmrc && \
    echo "//npm.pkg.github.com/:_authToken=$(cat /run/secrets/npm_token)" >> .npmrc && \
    npm install && \
    rm .npmrc

COPY . .

RUN npm run build:prod


FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./

RUN --mount=type=secret,id=npm_token \
    echo "@it-daily-store:registry=https://npm.pkg.github.com" > .npmrc && \
    echo "//npm.pkg.github.com/:_authToken=$(cat /run/secrets/npm_token)" >> .npmrc && \
    npm install --only=production && \
    rm .npmrc

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/.env.prod ./

# only if you have next.config.js
COPY --from=builder /app/next.config.ts ./next.config.ts

EXPOSE 7000

CMD ["npm", "start"]
