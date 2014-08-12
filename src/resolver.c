#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <netdb.h>
#include <arpa/inet.h>

#include <ares.h>
#include "resolver.h"

static void wait_ares(ares_channel channel) {
    for(;;){
        struct timeval *tvp, tv;
        fd_set read_fds, write_fds;
        int nfds;

        FD_ZERO(&read_fds);
        FD_ZERO(&write_fds);
        nfds = ares_fds(channel, &read_fds, &write_fds);
        if(nfds == 0) {
            break;
        }
        tvp = ares_timeout(channel, NULL, &tv);
        select(nfds, &read_fds, &write_fds, NULL, tvp);
        ares_process(channel, &read_fds, &write_fds);
    }
}

static void callback(void *arg, int status, int timeouts, struct hostent *host) {
    struct hostent *result = (struct hostent *)arg;
    char **p;
    char **h_addr_list = NULL, **h_aliases = NULL;
    int count = 0;
    int index = 0;

    if(!host || status != ARES_SUCCESS){
        printf("Failed to lookup %s\n", ares_strerror(status));
        return;
    }

    // Save return
    result->h_name = g_strdup(host->h_name);
    result->h_addrtype = host->h_addrtype;
    result->h_length   = host->h_length;

    // Alias
    for (p = host->h_aliases; *p; p++) {
        count++;
    }
    h_aliases = malloc((count+1) * sizeof(char *));
    for (p = host->h_aliases; *p; p++) {
        h_aliases[index] = malloc(sizeof(struct in_addr));
        if (h_aliases[index]) {
          memcpy(h_aliases[index], *p, sizeof(struct in_addr));
        }
        index++;
    }
    h_aliases[index] = NULL;
    result->h_aliases = h_aliases;

    // Address list
    count = index = 0;
    for (p = host->h_addr_list; *p; p++) {
        count++;
    }
    h_addr_list = malloc((count+1) * sizeof(char *));
    for (p = host->h_addr_list; *p; p++) {
        h_addr_list[index] = malloc(sizeof(struct in_addr));
        if (h_addr_list[index]) {
          memcpy(h_addr_list[index], *p, sizeof(struct in_addr));
        }
        index++;
    }
    h_addr_list[index] = NULL;
    result->h_addr_list = h_addr_list;
}


struct hostent *resolver_by_servers(gchar *name, gchar *nameserver) {
    ares_channel channel;
    int status, optmask = 0;
    struct ares_options options;
    struct hostent *results;

    status = ares_library_init(ARES_LIB_INIT_ALL);
    if (status != ARES_SUCCESS) {
        printf("ares_library_init: %s\n", ares_strerror(status));
        return NULL;
    }

    optmask = ARES_OPT_SERVERS | ARES_OPT_UDP_PORT;
    options.servers  = NULL;
    options.nservers = 0;
    options.flags    = ARES_FLAG_NOCHECKRESP;

    status = ares_init_options(&channel, &options, optmask);
    if(status != ARES_SUCCESS) {
        printf("ares_init_options: %s\n", ares_strerror(status));
        return NULL;
    }

    status = ares_set_servers_csv(channel, "192.168.50.4:49155");
    if (status != ARES_SUCCESS) {
      fprintf(stderr, "ares_set_servers_csv: %s\n", ares_strerror(status));
      return NULL;
    }

    // Wait resolver
    results = malloc(sizeof(struct hostent));
    ares_gethostbyname(channel, name, AF_INET, &callback, results);
    wait_ares(channel);
    ares_destroy(channel);
    ares_library_cleanup();

    if (results->h_name != NULL) {
      return results;
    }

    ares_free_hostent(results);
    return NULL;
}
