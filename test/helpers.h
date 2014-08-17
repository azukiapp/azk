
// State to test
typedef struct {
    char *servers;
    char *domain;
    char *fixtures;
    char *tmpdir;
} state_type;

int mock_resolver(char *tmpdir, char *domain, char *ns);
