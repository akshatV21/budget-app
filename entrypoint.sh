#!/bin/sh

pnpm run db:generate
pnpm run db:migrate:deploy

exec "$@"