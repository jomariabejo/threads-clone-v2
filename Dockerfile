# syntax=docker/dockerfile:1
FROM node:24-alpine

WORKDIR /app

COPY package.json package-lock.json* .npmrc ./

ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund

COPY . .

ARG VITE_API_URL=http://localhost:8082
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "start"]