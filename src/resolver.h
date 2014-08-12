#include <netdb.h>
#include <glib.h>

struct
hostent *resolver_by_servers(gchar *name,
                             gchar *nameserver);
