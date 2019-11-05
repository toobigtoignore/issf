# ISSF - Information System on Small Scale Fisheries
# Author: Joshua Murphy
# Date: December 23rd, 2018
# https://github.com/toobigtoignore/issf

# Docker file to build the ISSF software inside a Docker container 

FROM python:3.8-alpine3.10
ENV PYTHONUNBUFFERED 1
ENV LD_LIBRARY_PATH=/usr/lib

RUN apk update && \
    apk add --no-cache --repository http://dl-cdn.alpinelinux.org/alpine/edge/main openssl && \
    apk add --no-cache --repository http://dl-cdn.alpinelinux.org/alpine/edge/main g++ && \
    apk add --no-cache --repository http://dl-cdn.alpinelinux.org/alpine/edge/main make && \
    apk add --no-cache --repository http://dl-cdn.alpinelinux.org/alpine/edge/main linux-headers && \
    apk add --no-cache --repository http://dl-cdn.alpinelinux.org/alpine/edge/main wget && \
    apk add --no-cache --repository http://dl-cdn.alpinelinux.org/alpine/edge/main sudo && \
    # apk add --no-cache --repository http://dl-cdn.alpinelinux.org/alpine/edge/testing gdal-dev && \ version too high
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
COPY gdal-2.3.0.tar.gz /issf
COPY requirements.txt /issf
COPY package.json /issf
COPY package-lock.json /issf

WORKDIR /issf
RUN pip install -r requirements.txt && pip install --upgrade pip && npm install
RUN tar xzf gdal-2.3.0.tar.gz && cd gdal-2.3.0 && ./configure --with-python && make && sudo make install && cd ..
