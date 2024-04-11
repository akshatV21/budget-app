FROM node:19-alpine as development

WORKDIR /app

RUN npm install -g pnpm

COPY /package*.json .
COPY /pnpm-lock.yaml .
RUN pnpm install

COPY . .

RUN chmod +x ./entrypoint.sh

RUN pnpm run build

ENTRYPOINT ["./entrypoint.sh"]
CMD ["node", "dist/main"]