FROM dockerfile/python
MAINTAINER Everton Ribeiro <nuxlli@gmail.com>

RUN apt-get update -y
RUN apt-get install scons libglib2.0-dev libc-ares-dev -y

