# ISSF - Information System on Small Scale Fisheries
# Author: Joshua Murphy
# Date: February 2nd, 2018
# https://github.com/toobigtoignore/issf

# Docker file to build the ISSF software inside a Docker container 

FROM python:3
ENV PYTHONUNBUFFERED 1

RUN apt-get update 
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -
RUN apt-get -y install dialog apt-utils realpath coreutils libgeos-dev \
    gdal-bin binutils libproj-dev build-essential python-sphinx pylint nodejs \
    libxss1 libappindicator1 wget

RUN npm -v && npm install npm --global 

#RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
#RUN dpkg -i google-chrome*.deb
#RUN apt-get install -f 


RUN mkdir /issf/
ADD requirements.txt /issf
WORKDIR /issf
RUN pip install -r requirements.txt
#RUN wget https://chromedriver.storage.googleapis.com/2.40/chromedriver_linux64.zip
RUN export PATH=/usr/local/lib/python3.7/site-packages:$PATH

MAINTAINER Joshua Murphy  
