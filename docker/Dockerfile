FROM node:19-alpine as development

WORKDIR /app

RUN npm install -g pnpm

COPY /package*.json .
RUN pnpm install

COPY . .
RUN pnpm build

FROM node:19-alpine As production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

COPY /package*.json .
RUN pnpm install --prod

COPY --from=development /app/dist ./dist

CMD ["node", "dist/apps/spawns/main"]