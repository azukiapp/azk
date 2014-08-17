/*
 * NSS plugin for looking up by extra nameservers
 */

#include <errno.h>
#include <nss.h>
#include <netdb.h>
#include <stddef.h>
#include <stdio.h>
#include <string.h>
#include <arpa/inet.h>

/* define a suffix that containers have */
/*#define SUFFIX "tmp.dev"*/
#define NSSRS_DEFAULT_FOLDER "/etc/resolver/"

#include <ares.h>

#include "resolver.h"
#include "debug.h"

enum nss_status
_nss_resolver_gethostbyname2_r (const char *name,
        int af,
        struct hostent *result,
        char *buffer,
        size_t buflen,
        int *errnop,
        int *h_errnop)
{
    if (af != AF_INET) {
        *errnop = EAFNOSUPPORT;
        *h_errnop = NO_DATA;
        return NSS_STATUS_UNAVAIL;
    }

    debug("resolve: %s", name);
    struct hostent *hosts = nssrs_resolve(NSSRS_DEFAULT_FOLDER, (char *)name);

    if (!hosts || hosts->h_name == NULL) {
        *errnop = ENOENT;
        *h_errnop = HOST_NOT_FOUND;
        return NSS_STATUS_NOTFOUND;
    }

    char ip[INET6_ADDRSTRLEN];
    int i = 0;

    for (i = 0; hosts->h_addr_list[i]; ++i) {
        inet_ntop(hosts->h_addrtype, hosts->h_addr_list[i], ip, sizeof(ip));
        debug("ip: %s\n", ip);
    }

    nssrs_copy_hostent(hosts, result);
    ares_free_hostent(hosts);

    /*pack_hostent(result, buffer, buflen, name, &addr);*/

    return NSS_STATUS_SUCCESS;
}

enum nss_status
_nss_resolver_gethostbyname_r (const char *name,
        struct hostent *result,
        char *buffer,
        size_t buflen,
        int *errnop,
        int *h_errnop)
{
    return _nss_resolver_gethostbyname2_r(name,
            AF_INET,
            result,
            buffer,
            buflen,
            errnop,
            h_errnop);
}

enum nss_status
_nss_resolver_gethostbyaddr_r (const void *addr,
        socklen_t len,
        int af,
        struct hostent *result,
        char *buffer,
        size_t buflen,
        int *errnop,
        int *h_errnop)
{

    if (af != AF_INET) {
        *errnop = EAFNOSUPPORT;
        *h_errnop = NO_DATA;
        return NSS_STATUS_UNAVAIL;
    }

    if (len != sizeof (struct in_addr)) {
        *errnop = EINVAL;
        *h_errnop = NO_RECOVERY;
        return NSS_STATUS_UNAVAIL;
    }

    *errnop = EAFNOSUPPORT;
    *h_errnop = NO_DATA;
    return NSS_STATUS_UNAVAIL;
}
