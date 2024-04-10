FROM node:19-alpine as development

WORKDIR /app

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

RUN npm install -g pnpm

COPY /package*.json .
COPY /pnpm-lock.yaml .
RUN pnpm install

COPY . .
RUN pnpm build

RUN pnpm add prisma -g

RUN chmod +x ./docker/entrypoint.sh

ENTRYPOINT ["./docker/entrypoint.sh"]
CMD ["node", "dist/main"]