FROM node:19-alpine as development

WORKDIR /app

RUN npm install -g pnpm

COPY /package*.json .
COPY /pnpm-lock.yaml .
RUN pnpm install

RUN pnpm add prisma -g
RUN chmod +x ./docker/entrypoint.sh

COPY . .
RUN pnpm run build

ENTRYPOINT ["./docker/entrypoint.sh"]
CMD ["node", "dist/main"]