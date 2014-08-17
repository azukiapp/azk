#define _GNU_SOURCE

#include <stddef.h>
#include <dirent.h>
#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include <ctype.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <unistd.h>
#include <regex.h>

#include "files.h"

char *nssrs_str_join(char sep, char *folder, char *file) {
    char *path;
    size_t size = sizeof(char *) * (strlen(folder) + strlen(file) + 2);

    path = malloc(size);
    snprintf(path, size, "%s%c%s", folder, sep, file);

    return path;
}

int file_select(const struct dirent *entry) {
    int dot    = strcmp(entry->d_name, ".");
    int dotdot = strcmp(entry->d_name, "..");
    if (dot == 0 || dotdot == 0) {
        return 0;
    } else {
        return 1;
    }
}

const int endswith(char const *str,
                   char const *suffix,
                   int        lenstr,
                   int        lensuf)
{
    if( ! str && ! suffix ) return 1;
    if( ! str || ! suffix ) return 0;
    if( lenstr < 0 ) lenstr = strlen(str);
    if( lensuf < 0 ) lensuf = strlen(suffix);
    if( lenstr < lensuf) return 0;
    return strcmp(str + lenstr - lensuf, suffix) == 0;
}

const int match_sufix(char *path, char *file, char *name) {
    struct stat s;
    int err = stat(path, &s);
    if (err != 1 && S_ISREG(s.st_mode)) {
        return endswith(name, file, -1, -1);
    }
    return 0;
}

char *nssrs_getfile_by_sufix(char *folder, char *name) {
    struct dirent **namelist;
    char *file, *path = NULL, *finded = NULL;

    int n = scandir(folder, &namelist, file_select, alphasort);
    if (n >= 0) {
        while(n--) {
            // File path
            file = namelist[n]->d_name;
            path = nssrs_str_join('/', folder, file);
            if (match_sufix(path, file, name)) {
                if (!finded || (strlen(file) > strlen(finded))) {
                    if (finded) free(finded);
                    finded = strdup(file);
                }
            }
            nssrs_free(path);
            free(namelist[n]);
        }
        free(namelist);
    }

    if (finded) {
        path = nssrs_str_join('/', folder, finded);
        free(finded);
    }

    return path;
}

static char *trim(char * s) {
    int l = strlen(s);

    if (l > 1) {
        while(isspace(s[l - 1])) --l;
        while(* s && isspace(* s)) ++s, --l;
    }

    return strndup(s, l);
}

static char *extract_nameserver(char *line) {
    char *cline   = trim(line);
    char *address = NULL;

    if (cline[0] != '\n' && cline[0] != '#') {
        address = malloc(sizeof(char *) * (strlen(cline) + 1));
        sscanf(cline, "nameserver %[^#\n ]", address);
        if (strlen(address) == 0) {
            free(address);
            address = NULL;
        }
    }

    free(cline);
    return address;
}

struct resolver_file *nssrs_parse_routes(char *file) {
    struct resolver_file *rf = NULL;
    FILE *fp    = fopen(file, "r");
    char *line  = NULL;
    char *cline = NULL;
    char *nss   = NULL, *old = NULL;
    size_t len  = 0;
    ssize_t read;

    if (fp != NULL) {
        while ((read = getline(&line, &len, fp)) != -1) {
            cline = extract_nameserver(line);
            if (cline && nss) {
                old = nss;
                nss = nssrs_str_join(',', nss, cline);
                free(old);
                free(cline);
            } else if (cline) {
                nss = cline;
            }
        }
        fclose(fp);
    }

    nssrs_free(line);

    if (nss) {
        rf = malloc(sizeof(struct resolver_file *));
        rf->servers = nss;
    }

    return rf;
}
