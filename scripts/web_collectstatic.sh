#!/bin/bash

if [ -x "$(command -v inotifywait)" ]; then
    while true; do
        inotifywait -r static_root/ && docker-compose exec -T web \
        /bin/sh -c 'python manage.py collectstatic --noinput'
    done
    exit 0
fi

if [ -x "$(command -v fswatch)" ]; then
    fswatch -o ./static_root | xargs -n1 -I{}  docker-compose exec -T web /bin/sh -c 'python manage.py collectstatic --noinput'
    exit 0
fi

printf "either fswatch or inotifywait is not installed!"
exit 1