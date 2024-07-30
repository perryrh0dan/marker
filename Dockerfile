FROM node:18 AS builder

COPY . .

RUN npm i
RUN npm run build

FROM nginx:alpine

COPY /default.conf /etc/nginx/conf.d/default.conf

COPY --from=builder ./dist /usr/share/nginx/html/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
