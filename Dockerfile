FROM node:22-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./
COPY ticketbot/package.json ticketbot/package.json
COPY discordhooks/package.json discordhooks/package.json
COPY discordadmins/package.json discordadmins/package.json
COPY frontend/package.json frontend/package.json

RUN npm install

COPY . .

ENV NODE_ENV=production
ENV VITE_API_URL=/api
ENV VITE_SOCKET_URL=/

RUN npm run frontend:build

EXPOSE 4000
EXPOSE 4173

CMD ["npx","concurrently","-n","ticketbot,hooks,frontend","-c","yellow,blue,green","npm run ticketbot:start","npm run hooks:start","npm --workspace frontend run preview -- --host 0.0.0.0 --port 4173"]
