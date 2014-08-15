
struct resolver_file {
    char *servers;
};

char *path_join(char sep, char *folder, char *file);
char *getfile_by_sufix(char *folder, char *name);
struct resolver_file *parse_resolver_file(char *file);
