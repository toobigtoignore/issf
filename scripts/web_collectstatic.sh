#!/bin/bash
while true; do
    inotifywait -r static_root/ && docker-compose -f $1 exec -T web \
    /bin/sh -c 'python manage.py collectstatic --noinput'
done
