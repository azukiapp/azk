#!/bin/sh
set -e

log() {
    echo "$*"
}

remove_resolver() {
    file=/etc/nsswitch.conf
    log "Checking NSS setup..."
    # abort if /etc/nsswitch.conf does not exist
    if ! [ -e /etc/nsswitch.conf ]; then
        log "Could not find /etc/nsswitch.conf."
        return
    fi

    log "Removing resolver from /etc/nsswitch.conf"
    sed -i -re "s/(hosts:.*)\s{1,}resolver($|\s\w)(.*)/\1\2\3/; s/\s*$//;" /etc/nsswitch.conf
}

remove_resolver

