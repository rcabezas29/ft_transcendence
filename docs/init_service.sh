#!/bin/bash 

cd /app
chmod +x ininit_service.sh
bundle add webrick
bundle install
bundle exec jekyll serve --host 0.0.0.0 --force_polling
