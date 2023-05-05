FROM node as build

WORKDIR /app
COPY ./srcs/frontend /app
RUN npm install
RUN npm run build-only

FROM nginx

COPY --from=build /app/dist /var/www/html/
COPY ./requirements/nginx/nginx.conf /etc/nginx/conf.d/default.conf

ENTRYPOINT ["nginx", "-g", "daemon off;"]
