FROM drogonframework/drogon

RUN apt-get -y update
RUN apt-get -y install build-essential make xorg imagemagick libasan5 libx11-dev

COPY ./start.sh /start.sh

WORKDIR /app

ENTRYPOINT ["/start.sh"]