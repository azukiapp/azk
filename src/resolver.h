#include <netdb.h>
#include <glib.h>

void nssrs_copy_hostent(struct hostent *from, struct hostent *to);
struct hostent *nssrs_resolver_by_servers(gchar *name, gchar *nameserver);
struct hostent *nssrs_resolve(char *folder, char *domain);
