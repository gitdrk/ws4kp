FROM node:18-alpine
WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN npm ci

RUN ln -sf /mnt/weatherstar /app/server/live

COPY . .
CMD ["node", "index.js"]
