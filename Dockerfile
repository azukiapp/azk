FROM dockerfile/python
MAINTAINER Everton Ribeiro <nuxlli@gmail.com>

RUN apt-get update -y
RUN apt-get install -y \
                    scons automake autoconf ghostscript \
                    clang libblocksruntime-dev libcmocka-dev \
                    dnsutils libglib2.0-dev
