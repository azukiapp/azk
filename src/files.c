#include <stddef.h>
#include <dirent.h>
#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <unistd.h>

char *path_join(char sep, char *folder, char *file) {
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

char *getfile_by_sufix(char *folder, char *name) {
    struct dirent **namelist;
    char *path, *file, *finded = NULL;

    int n = scandir(folder, &namelist, file_select, alphasort);
    if (n >= 0) {
        while(n--) {
            // File path
            file = namelist[n]->d_name;
            path = path_join('/', folder, file);
            if (match_sufix(path, file, name)) {
                if (!finded || (strlen(file) > strlen(finded))) {
                    if (finded) free(finded);
                    finded = strdup(file);
                }
            }
            free(path);
            free(namelist[n]);
        }
        free(namelist);
    }

    path = NULL;
    if (finded) {
        path = path_join('/', folder, finded);
        free(finded);
    }

    return path;
}
