#include <unistd.h>
#include <stdio.h>
#include "helpers.h"
#include "../src/files.h"

int mock_resolver(char *tmpdir, char *domain, char *ns) {
    char *file = nssrs_str_join('/', tmpdir, domain);
    FILE *fd   = fopen(file, "w");
    int result = 0;

    if (fd != NULL) {
      fprintf(fd, "nameserver %s\n", ns);
      fclose(fd);
      result = 1;
    } else {
      fprintf(stderr, "Unable to write: %s\n", file);
    }

    free(file);
    return result;
}

int mock_resolver_clean(char *tmpdir, char *domain) {
    char *file = nssrs_str_join('/', tmpdir, domain);
    int result = 0;

    if( access( file, F_OK ) != -1 ) {
        result = unlink(file);
    }

    free(file);
    return result;
}
