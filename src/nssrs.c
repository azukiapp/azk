/*
 * NSS plugin for looking up by extra nameservers
 */

#include <errno.h>
#include <stddef.h>
#include <stdio.h>
#include <string.h>

#include <nss.h>
#include <netdb.h>
#include <arpa/inet.h>
#include <ares.h>

#include "resolver.h"
#include "debug.h"

#define ALIGN(a) (((a+sizeof(void*)-1)/sizeof(void*))*sizeof(void*))

static void
pack_hostent(struct hostent *result,
        char *buffer,
        size_t buflen,
        const char *name,
        const void *addr)
{
    char *aliases, *r_addr, *addrlist;
    size_t l, idx;

    /* we can't allocate any memory, the buffer is where we need to
     * return things we want to use
     *
     * 1st, the hostname */
    l = strlen(name);
    result->h_name = buffer;
    memcpy (result->h_name, name, l);
    buffer[l] = '\0';

    idx = ALIGN (l+1);

    /* 2nd, the empty aliases array */
    aliases = buffer + idx;
    *(char **) aliases = NULL;
    idx += sizeof (char*);

    result->h_aliases = (char **) aliases;

    result->h_addrtype = AF_INET;
    result->h_length = sizeof (struct in_addr);

    /* 3rd, address */
    r_addr = buffer + idx;
    memcpy(r_addr, addr, result->h_length);
    idx += ALIGN (result->h_length);

    /* 4th, the addresses ptr array */
    addrlist = buffer + idx;
    ((char **) addrlist)[0] = r_addr;
    ((char **) addrlist)[1] = NULL;

    result->h_addr_list = (char **) addrlist;
}

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

    struct hostent *hosts = nssrs_resolve(NSSRS_DEFAULT_FOLDER, (char *)name);

    if (!hosts || hosts->h_name == NULL) {
        *errnop = ENOENT;
        *h_errnop = HOST_NOT_FOUND;
        return NSS_STATUS_NOTFOUND;
    }

    pack_hostent(result, buffer, buflen, name, hosts->h_addr_list[0]);
    ares_free_hostent(hosts);

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
