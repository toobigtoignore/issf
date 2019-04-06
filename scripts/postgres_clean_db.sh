#Only neeeded if we are cleaning sensitive artifacts from a DB.

docker-compose -f $1 exec -T db \
/bin/bash -c "psql -U postgres issf_prod -f /data/postgres/clean_db.sql"

