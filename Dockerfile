# ISSF - Information System on Small Scale Fisheries
# Author: Joshua Murphy
# Date: August 21st, 2018
# https://github.com/toobigtoignore/issf

# Docker file to build the ISSF software inside a Docker container 

FROM python:3
ENV PYTHONUNBUFFERED 1

RUN apt-get update
RUN apt-get -y install --allow-unauthenticated dialog apt-utils realpath coreutils libgeos-dev \
    gdal-bin binutils libproj-dev build-essential python-sphinx pylint \
    libxss1 libappindicator1 wget virtualenv

RUN mkdir /issf/
ADD requirements.txt /issf
ADD package.json /issf
ADD package-lock.json /issf

WORKDIR /issf
RUN pip install -r requirements.txt
RUN pip install --upgrade pip

RUN curl -sL https://deb.nodesource.com/setup_10.x | bash -
RUN apt-get install -y nodejs
RUN npm install

RUN virtualenv ../issf
