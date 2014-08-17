#include <stdarg.h>
#include <stdlib.h>

#define nssrs_free(__p) do { if(__p) free(__p); __p = NULL; } while (0)

struct resolver_file {
    char *servers;
};

char *nssrs_str_join(char sep, char *folder, char *file);
char *nssrs_getfile_by_sufix(char *folder, char *name);
struct resolver_file *nssrs_parse_routes(char *file);
