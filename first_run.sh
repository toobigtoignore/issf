#!/bin/bash
# Filename: first_run.sh
# Author: Joshua Murphy
# Date: May 23rd, 2018
# https://github.com/toobigtoignore/issf

docker-compose up -d postgres
./scripts/wait-for-it.sh --strict localhost:5432 -- sleep 30 && ./scripts/postgres_setup.sh
docker-compose up -d
