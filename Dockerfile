FROM node:18-alpine
WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN npm ci

RUN mkdir -p /app/server && ln -s /mnt/weatherstar /app/server/live


COPY . .
CMD ["node", "index.js"]
