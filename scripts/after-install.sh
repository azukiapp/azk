#!/bin/sh
set -e

log() {
    echo "$*"
}

install_resolver() {
    file=/etc/nsswitch.conf
    log "Checking NSS setup..."
    # abort if /etc/nsswitch.conf does not exist
    if ! [ -e $file ]; then
        log "Could not find $file."
        return
    fi

    log "Adding resolver from $file"
    if ! grep -qe "hosts:.*\sresolver$" -e "hosts:.*\sresolver\s" $file ; then
      sed -i -re 's/^(hosts: .*)$/\1 resolver/' $file
    fi;
}

install_resolver
