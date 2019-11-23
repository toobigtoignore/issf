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

WORKDIR /gdal
RUN wget https://github.com/OSGeo/gdal/archive/v2.3.0.tar.gz
RUN tar xzf v2.3.0.tar.gz && \
    cd gdal-2.3.0/gdal && \
    ./configure --with-python && \
    make && \
    sudo make install

RUN apk del g++ make linux-headers wget sudo

WORKDIR /issf
RUN rm -rf /gdal
COPY requirements.txt .
COPY package.json .
COPY package-lock.json .
RUN pip install -r requirements.txt && pip install --upgrade pip && npm install