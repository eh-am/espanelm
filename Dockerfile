FROM node:latest AS builder
WORKDIR /app
COPY . /app
RUN npm install
RUN npm run build


FROM node:alpine
WORKDIR /app
COPY --from=builder /app/dist /app
COPY --from=builder /app/node_modules /app/node_modules

ADD entrypoint.sh /app/entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]