# ISSF - Information System on Small Scale Fisheries
# Author: Joshua Murphy
# Date: December 23rd, 2018
# Version 1.1 [Marcos Macedo, May 24th of 2020]
# https://github.com/toobigtoignore/issf

# Docker file to build the ISSF software inside a Docker container 

FROM python:3.7.7-stretch

#Settings to have GEOS lib detected
ENV PYTHONUNBUFFERED 1
ENV LD_LIBRARY_PATH=/usr/lib

RUN apt-get update && apt-get install -y curl libgdal-dev python3-gdal libpng-dev zlib1g-dev libjpeg-dev libgeos-dev postgis
RUN curl -sL https://deb.nodesource.com/setup_10.x | bash - && apt-get install -y nodejs


WORKDIR /issf
COPY requirements.txt .
COPY package.json .
COPY package-lock.json .
RUN ln -s /usr/lib/x86_64-linux-gnu/libgeos_c.so.1 /usr/lib/
RUN pip install -r requirements.txt && pip install --upgrade pip && npm install
