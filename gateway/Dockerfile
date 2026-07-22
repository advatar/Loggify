FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY gateway/package.json gateway/package.json
COPY sdk/typescript/package.json sdk/typescript/package.json
RUN npm install
COPY gateway gateway
RUN npm run build -w @loggify/gateway

FROM node:24-alpine
ENV NODE_ENV=production
USER node
WORKDIR /app
COPY --from=build --chown=node:node /app/gateway/dist ./dist
EXPOSE 8080
CMD ["node", "dist/server.js"]

