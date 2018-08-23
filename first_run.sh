#!/bin/bash
# Filename: first_run.sh
# Author: Joshua Murphy
# Date: May 23rd, 2018
# https://github.com/toobigtoignore/issf

docker-compose up -d db 
./scripts/wait-for-it.sh --strict localhost:5432 -- echo "Waiting 60 seconds
for Postgres container..." && sleep 60 && ./scripts/postgres_setup.sh
docker-compose up -d 

# Create a virtualenv that Nginx/Django integration seems to 
# require ...
docker-compose exec -T web /bin/bash -c 'virtualenv ../issf/'
