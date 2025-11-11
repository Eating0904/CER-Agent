# install and build
FROM node:22.17-alpine3.21 AS builder

WORKDIR /app

COPY . .

RUN yarn install

RUN yarn build

# Final Stage
FROM nginx:1.29.0 AS final

WORKDIR /app

COPY --from=builder /app/dist /usr/share/nginx/html

COPY ./nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY ./nginx/entrypoint.sh ./entrypoint.sh

RUN chmod +x ./entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]
