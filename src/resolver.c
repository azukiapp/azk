#include <stdio.h>
#include <ares.h>
#include <stdlib.h>
#include <string.h>
#include <netdb.h>
#include <arpa/inet.h>

#include "resolver.h"

static void wait_ares(ares_channel channel);
static void callback(void *arg, int status, int timeouts, struct hostent *host);

static void wait_ares(ares_channel channel) {
    for(;;){
        struct timeval *tvp, tv;
        fd_set read_fds, write_fds;
        int nfds;

        FD_ZERO(&read_fds);
        FD_ZERO(&write_fds);
        nfds = ares_fds(channel, &read_fds, &write_fds);
        if(nfds == 0){
            break;
        }
        tvp = ares_timeout(channel, NULL, &tv);
        select(nfds, &read_fds, &write_fds, NULL, tvp);
        ares_process(channel, &read_fds, &write_fds);
    }
}

static void callback(void *arg, int status, int timeouts, struct hostent *host) {
    if(!host || status != ARES_SUCCESS){
        printf("Failed to lookup %s\n", ares_strerror(status));
        return;
    }

    printf("Found address name %s\n", host->h_name);
    char ip[INET6_ADDRSTRLEN];
    int i = 0;

    for (i = 0; host->h_addr_list[i]; ++i) {
        inet_ntop(host->h_addrtype, host->h_addr_list[i], ip, sizeof(ip));
        printf("%s\n", ip);
    }
}

gboolean resolver(const gchar *name, const gchar *nameserver) {
    ares_channel channel;
    int status, optmask = 0;
    struct ares_options options;

    status = ares_library_init(ARES_LIB_INIT_ALL);
    if (status != ARES_SUCCESS){
        printf("ares_library_init: %s\n", ares_strerror(status));
        return FALSE;
    }

    optmask = ARES_OPT_SERVERS | ARES_OPT_UDP_PORT;
    options.servers  = NULL;
    options.nservers = 0;
    options.udp_port = (unsigned short)strtol("49155", NULL, 0);
    options.flags = ARES_FLAG_NOCHECKRESP;

    status = ares_init_options(&channel, &options, optmask);
    if(status != ARES_SUCCESS) {
        printf("ares_init_options: %s\n", ares_strerror(status));
        return FALSE;
    }

    status = ares_set_servers_csv(channel, nameserver);
    if (status != ARES_SUCCESS) {
      fprintf(stderr, "ares_init_options: %s\n", ares_strerror(status));
      return 1;
    }

    ares_gethostbyname(channel, name, AF_INET, &callback, NULL);
    wait_ares(channel);
    ares_destroy(channel);
    ares_library_cleanup();

    return TRUE;
}

