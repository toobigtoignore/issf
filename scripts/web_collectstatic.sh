#!/bin/bash
while true; do
    inotifywait -r static_root/ && docker-compose exec -T web \
    /bin/sh -c 'python manage.py collectstatic --noinput'
done
