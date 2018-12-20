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
    libxss1 libappindicator1 wget virtualenv gconf-service libasound2 \
    libatk1.0-0 libcairo2 libcups2 libfontconfig1 libgdk-pixbuf2.0-0 \
    libgtk-3-0 libnspr4 libpango-1.0-0 libxss1 fonts-liberation \
    libappindicator3-1 libnss3 lsb-release xdg-utils
RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
RUN dpkg -i google-chrome-stable_current_amd64.deb; apt-get -fy install

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
