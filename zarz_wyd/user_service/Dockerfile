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
EXPOSE 4000
CMD ["node", "src/index.js"]

# Wersja 1:
# # Budowanie
# FROM node:18-alpine AS builder
# WORKDIR /app
# COPY package*.json ./
# RUN apt-get update && apt-get install -y curl
# RUN npm install
# COPY . .

# # Etap produkcyjny
# FROM node:18-alpine
# WORKDIR /app
# COPY --from=builder /app .
# RUN npm prune --production
# ENV NODE_ENV=production
# EXPOSE 4000
# CMD ["node", "src/index.js"]

# Wersja 2:
# # Budowanie
# FROM node:18-alpine AS builder
# WORKDIR /app
# COPY package*.json ./
# RUN npm install
# RUN apt-get update && apt-get install -y curl
# COPY . .

# # Etap produkcyjny
# FROM node:18-alpine
# WORKDIR /app
# COPY --from=builder /app .
# RUN npm prune --production
# ENV NODE_ENV=production
# EXPOSE 4000
# CMD ["node", "src/index.js"]