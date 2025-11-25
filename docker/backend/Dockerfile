# Backend FinTrack - Node + TypeScript (build dentro del contenedor)
FROM node:20-alpine

WORKDIR /app

# Copiamos package.json y package-lock.json
COPY backend/package*.json ./

# Instalamos TODAS las dependencias (incluye typescript)
RUN npm install

# Copiamos el resto del código del backend
COPY backend/ ./

# Compilamos TypeScript dentro del contenedor -> genera /app/dist
RUN npm run build

# Variables de entorno
ENV PORT=4000

EXPOSE 4000

# Arrancamos el servidor ya compilado
CMD ["node", "dist/server.js"]