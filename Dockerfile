FROM oven/bun:1.4-alpine AS build
WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile
COPY src ./src
COPY tsconfig.json ./
RUN bun build --compile --minify --target=bun-linux-x64-musl ./src/index.ts --outfile server

FROM alpine:3.20
RUN apk add --no-cache libstdc++ && adduser -D -u 10001 app
COPY --from=build /app/server /usr/local/bin/server
USER 10001
ENV PORT=8080
EXPOSE 8080
ENTRYPOINT ["/usr/local/bin/server"]