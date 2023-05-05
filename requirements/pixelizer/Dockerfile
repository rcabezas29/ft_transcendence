FROM drogonframework/drogon

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get -y update
RUN apt-get -y install build-essential make xorg imagemagick libasan5 libx11-dev

COPY ./requirements/pixelizer/start.sh /start.sh

WORKDIR /app

COPY srcs/pixelizer /app/

WORKDIR /app/pixelizer_service/build

RUN cmake ..
RUN make

ENTRYPOINT ["/start.sh"]