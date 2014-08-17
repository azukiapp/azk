#include <netdb.h>
#include <glib.h>

struct hostent *nssrs_resolver_by_servers(gchar *name, gchar *nameserver);
struct hostent *nssrs_resolve(char *folder, char *domain);
