# FROM node:18-alpine AS builder
# WORKDIR /app
# COPY package*.json ./
# RUN apt-get update && apt-get install -y curl
# RUN npm install
# COPY . .

# FROM node:18-alpine
# WORKDIR /app
# COPY --from=builder /app .
# RUN npm prune --production
# ENV NODE_ENV=production
# EXPOSE 4005
# CMD ["node", "src/index.js"]

# Etap 1: builder
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN apk add --no-cache curl
COPY . .

# Etap 2: produkcyjny
FROM node:18-alpine
WORKDIR /app
RUN apk add --no-cache curl
COPY --from=builder /app .
RUN npm prune --production
ENV NODE_ENV=production
EXPOSE 4005
CMD ["node", "src/index.js"]