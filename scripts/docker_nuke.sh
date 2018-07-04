#!/bin/bash
# Author: Joshua Murphy
# Date: February 1st, 2018
# Licensed under the GNU GPL v3.
# https://github.com/toobigtoignore/issf

# The following script is used for removing the ISSF docker containers. 
# It's purpose is for when containers are acting up, and you feel that 
# removing them and building them again from the downloaded image is 
# the solution. 

docker-compose stop 
docker-compose rm -fv

