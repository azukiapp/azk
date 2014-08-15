
struct resolver_file {
    char *servers;
};

char *nssrs_str_join(char sep, char *folder, char *file);
char *nssrs_getfile_by_sufix(char *folder, char *name);
struct resolver_file *nssrs_parse_resolver_file(char *file);
