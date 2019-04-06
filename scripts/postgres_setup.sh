#!/bin/bash
# Filename: postgres_setup.sh
# Author: Joshua Murphy
# Date: December 13th, 2018
# https://github.com/toobigtoignore/issf

# The following script is for populating a database with the ISSF test
# data. It by default attempts to populate a container named postgres.
# Note that it is designed to be run outside of the container.

docker-compose -f $1 exec -T db \
/bin/bash -c 'psql -U postgres -c "DROP DATABASE IF EXISTS issf_prod"'

docker-compose -f $1 exec -T db \
/bin/bash -c 'psql -U postgres -c "CREATE DATABASE issf_prod"'

docker-compose -f $1 exec -T db \
/bin/bash -c "psql -U postgres issf_prod < /data/postgres/dummy_database.pgsql"
