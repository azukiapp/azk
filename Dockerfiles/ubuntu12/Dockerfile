FROM ubuntu:12.04
MAINTAINER Everton Ribeiro <everton@azukiapp.com>

RUN \
  sed -i 's/# \(.*multiverse$\)/\1/g' /etc/apt/sources.list && \
  apt-get update && \
  apt-get -y upgrade && \
  apt-get install -y build-essential && \
  apt-get install -y software-properties-common && \
  apt-get install -y git wget && \
  apt-get install -y scons cmake automake autoconf ghostscript && \
  apt-get install -y clang valgrind && \
  apt-get install -y dnsutils
