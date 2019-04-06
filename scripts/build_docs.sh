#!/bin/sh

docker-compose -f $1 exec web /bin/sh /issf/scripts/_build_docs.sh
