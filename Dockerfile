FROM node:18-alpine
WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN npm ci
VOLUME ["/mnt/weatherstar"]

RUN ln -sfn /mnt/weatherstar /app/server/live


COPY . .
CMD ["node", "index.js"]
