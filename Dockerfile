# Stage 1: Build frontend
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Run with Express server
FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY server/ ./server/
RUN cd server && npm install --production
EXPOSE 1245
VOLUME /data
CMD ["node", "server/index.js"]
