FROM node:18-alpine
WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN npm ci

RUN [ -e /app/server/live ] && rm -rf /app/server/live || true && ln -s /mnt/weatherstar /app/server/live

COPY . .
CMD ["node", "index.js"]
