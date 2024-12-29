FROM node:18-alpine
WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN npm ci
VOLUME ["/mnt/weatherstar"]

COPY . .

# Debugging: List the file structure at various levels
RUN echo "Contents of /:" && ls -l / && \
  echo "Contents of /mnt:" && ls -l /mnt && \
  echo "Contents of /app:" && ls -l /app && \
  echo "Contents of /app/server:" && ls -l /app/server || echo "/app/server does not exist"

RUN ln -sfn /mnt/weatherstar /app/server/live



CMD ["node", "index.js"]
