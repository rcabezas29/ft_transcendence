FROM node:18

COPY ./srcs/backend /app

WORKDIR /app

RUN npm i -g @nestjs/cli
RUN npm install

ENTRYPOINT ["bash", "entrypoint.sh"]