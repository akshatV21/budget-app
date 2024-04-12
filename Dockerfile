FROM node:19-alpine as development

WORKDIR /app

RUN npm install -g pnpm

COPY /package*.json .
COPY /pnpm-lock.yaml .

RUN pnpm install

COPY . .

RUN pnpm db:generate

RUN pnpm run build

RUN chmod +x ./entrypoint.sh

EXPOSE 8080

ENTRYPOINT ["./entrypoint.sh"]
CMD ["node", "dist/main"]