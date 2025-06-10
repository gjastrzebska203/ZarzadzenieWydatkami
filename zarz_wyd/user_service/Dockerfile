# builder
FROM node:18-alpine AS builder
# katalog roboczy w kontenerze na /app
WORKDIR /app 
# kopiuje pliki package.json i package-lock.json, instaluje wszystkie zależności 
COPY package*.json ./
RUN npm install
# dodaje curl potrzebny do healthchecka.
RUN apk add --no-cache curl
# kopiuje cały kod aplikacji do /app
COPY . .

# production
FROM node:18-alpine
WORKDIR /app
RUN apk add --no-cache curl
# kopiuje gotowy kod z poprzedniego etapu (już z npm install)
COPY --from=builder /app .
# usuwa zależności deweloperskie (devDependencies), pozostawia tylko to, co potrzebne do działania
RUN npm prune --production
# ustawia tryb produkcyjny
ENV NODE_ENV=production
# otwiera port 4000
EXPOSE 4000
CMD ["node", "src/index.js"]
