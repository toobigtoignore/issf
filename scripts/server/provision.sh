#!/bin/bash
# Filename: provision.sh
# Author: Joshua Murphy
# Date: May 28th, 2018
# https://github.com/toobigtoignore/issf

# Install jenkins and it's requisites 

wget -q -O - https://pkg.jenkins.io/debian-stable/jenkins.io.key | sudo apt-key add -
sudo su root -c "echo deb https://pkg.jenkins.io/debian-stable binary/ >> /etc/apt/sources.list"
sudo apt update
sudo apt install openjdk-8-jdk openjdk-8-jre jenkins

sudo systemctl enable jenkins
sudo systemctl start jenkins
sudo systemctl status jenkins

# Install docker and docker-compose

sudo apt remove docke docker-engine docker.io 
sudo apt update
sudo apt install apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

sudo add-apt-repository \
   "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
   $(lsb_release -cs) \
   stable"

sudo apt update
sudo apt install docker-ce docker-compose

sudo groupadd docker
sudo usermod -aG docker $USER
sudo usermod -aG docker jenkins 

sudo systemctl enable docker
echo "Reboot may be required before Docker has the correct permissions to run."

# Lastly install git
sudo apt install git
