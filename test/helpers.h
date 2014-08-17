
// State to test
typedef struct {
    char *servers;
    char *domain;
    char *fixtures;
    char *tmpdir;
} state_type;

int mock_resolver(char *tmpdir, char *domain, char *ns);
int mock_resolver_clean(char *tmpdir, char *domain);
