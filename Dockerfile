FROM node:24-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

# VITE_API_URL is inlined into the client bundle at build time by Vite,
# so it must be available before `npm run build` runs.
ARG VITE_API_URL=http://localhost:8082
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "start"]
