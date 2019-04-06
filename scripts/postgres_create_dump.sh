docker-compose -f $1 exec db pg_dump -U postgres issf_prod > dummydump.pgsql
