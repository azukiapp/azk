FROM fedora:20
MAINTAINER Everton Ribeiro <everton@azukiapp.com>

RUN yum -y update; yum clean all
RUN yum -y install git wget\
                   scons make cmake automake autoconf \
                   gcc clang valgrind \
                   bind-utils; yum clean all
