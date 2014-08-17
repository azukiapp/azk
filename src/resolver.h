#include <netdb.h>

void nssrs_copy_hostent(struct hostent *from, struct hostent *to);
struct hostent *nssrs_resolver_by_servers(char *name, char *nameserver);
struct hostent *nssrs_resolve(char *folder, char *domain);
