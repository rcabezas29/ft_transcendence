FROM ruby:3.1.2-bullseye

RUN apt-get update
RUN gem install jekyll

ENTRYPOINT ["bash", "./app/init_service.sh"]
