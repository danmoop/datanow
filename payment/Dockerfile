FROM oven/bun:1
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates gettext-base

COPY package.json bun.lock ./
RUN bun install

RUN node node_modules/@solana/pay/install.cjs

COPY . .

EXPOSE 1402

CMD ["/bin/sh", "-c", "envsubst < provider.yml > provider-resolved.yml && ./node_modules/.bin/pay server start ./provider-resolved.yml"]