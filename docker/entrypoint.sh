#!/bin/sh

pnpm run db:generate
pnpm run db:deploy

exec "$@"