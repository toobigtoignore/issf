# ISSF - Information System on Small Scale Fisheries
# Author: Joshua Murphy
# Date: December 23rd, 2018
# https://github.com/toobigtoignore/issf

# Docker file to build the ISSF software inside a Docker container 

FROM python:3.7-alpine
ENV PYTHONUNBUFFERED 1
ENV LD_LIBRARY_PATH=/usr/lib

RUN apk update && \
    apk add --no-cache --repository http://dl-cdn.alpinelinux.org/alpine/edge/main openssl && \
    apk add --no-cache --repository http://dl-cdn.alpinelinux.org/alpine/edge/testing gdal-dev && \
    apk add --no-cache --repository http://dl-cdn.alpinelinux.org/alpine/edge/testing proj && \
    apk add --no-cache --repository http://dl-cdn.alpinelinux.org/alpine/edge/testing geos && \
    apk add --update libressl2.7-libcrypto &&  \
    apk add --no-cache \
    binutils \
    libressl2.7-libcrypto \
    openssl \ 
    coreutils \
    chromium \
    nodejs \
    nodejs-npm \
    libmount \
    gcc \
    python3-dev \
    musl-dev \
    postgresql-dev \
    && pip install --no-cache-dir psycopg2 

RUN mkdir /issf
ADD requirements.txt /issf
ADD package.json /issf
ADD package-lock.json /issf

WORKDIR /issf
RUN pip install -r requirements.txt && pip install --upgrade pip && npm install
