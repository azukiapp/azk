#include <errno.h>
#include <glib.h>
#include <glib/gstdio.h>
#include <netdb.h>
#include <arpa/inet.h>
#include <sys/socket.h>
#include <stdlib.h>
#include <string.h>

#define BADGER_DOCKER_IP "172.11.22.33"

#include "resolver.h"

// Util to get envs
gchar* get_env(const gchar *key) {
    gchar *value;
    gchar **environ;

    environ = g_get_environ();
    if (environ != NULL) {
        value = g_strdup(g_environ_getenv(environ, key));
        return value;
    }

    return NULL;
}

// static void test_gethostbyname (void) {
//     struct hostent *results;
//     char buffer[INET_ADDRSTRLEN];
//     gchar *host = get_env("DNS_DOMAIN") ;
//
//     results = gethostbyname(host);
//     g_free(host);
//
//     g_assert(results != NULL);
//
//     g_assert_cmpstr(results->h_name, ==, host);
//     g_assert(results->h_aliases[0] == NULL);
//     g_assert_cmpint(results->h_addrtype, ==, AF_INET);
//     g_assert_cmpint(results->h_length, ==, 4);
//     g_assert(results->h_addr_list[0] != NULL);
//     g_assert(results->h_addr_list[1] == NULL);
//
//     inet_ntop(AF_INET, results->h_addr_list[0], buffer, INET_ADDRSTRLEN);
//     g_assert_cmpstr(buffer, ==, BADGER_DOCKER_IP);
// }

static void test_gethostbyname_unknown_name (void) {
    struct hostent *results;
    gchar *host = get_env("DNS_DOMAIN") ;

    results = gethostbyname(host);
    g_free(host);

    g_assert(results == NULL);
    g_assert_cmpint(h_errno, ==, HOST_NOT_FOUND);
}

/*static void*/
/*test_gethostbyname2 (void)*/
/*{*/
    /*struct hostent *results;*/
    /*char buffer[INET_ADDRSTRLEN];*/

    /*results = gethostbyname2("badger.docker", AF_INET);*/

    /*g_assert(results != NULL);*/

    /*g_assert_cmpstr(results->h_name, ==, "badger.docker");*/
    /*g_assert(results->h_aliases[0] == NULL);*/
    /*g_assert_cmpint(results->h_addrtype, ==, AF_INET);*/
    /*g_assert_cmpint(results->h_length, ==, 4);*/
    /*g_assert(results->h_addr_list[0] != NULL);*/
    /*g_assert(results->h_addr_list[1] == NULL);*/

    /*inet_ntop(AF_INET, results->h_addr_list[0], buffer, INET_ADDRSTRLEN);*/
    /*g_assert_cmpstr(buffer, ==, BADGER_DOCKER_IP);*/
/*}*/

/*static void*/
/*test_gethostbyname2_inet6 (void)*/
/*{*/
    /*struct hostent *results;*/

    /*results = gethostbyname2("badger.docker", AF_INET6);*/

    /*g_assert(results == NULL);*/
    /*g_assert_cmpint(errno, ==, EAFNOSUPPORT);*/
    /*g_assert_cmpint(h_errno, ==, NO_DATA);*/
/*}*/

static void test_resolver_by_server(void) {
    struct hostent *results = NULL;
    gchar *host    = get_env("DNS_DNS_HOST");
    gchar *port    = get_env("DNS_DNS_PORT");
    gchar *domain  = get_env("DNS_DOMAIN");
    gchar *servers = g_strdup_printf("%s:%s", host, port);

    results = resolver_by_servers(domain, servers);

    g_assert(results != NULL);
    g_assert_cmpstr(results->h_name, ==, domain);
    g_assert(results->h_aliases[0] == NULL);
    g_assert_cmpint(results->h_addrtype, ==, AF_INET);
    g_assert_cmpint(results->h_length, ==, 4);
    g_assert(results->h_addr_list[0] != NULL);
    g_assert(results->h_addr_list[1] == NULL);

    /*g_free(host);*/
    g_free(port);
    g_free(domain);
    g_free(servers);
    ares_free_hostent(results);
}

static gboolean clean_resolver(const gchar *dirname) {
    GDir *dir;
    const gchar *filename;
    gboolean success = FALSE;

    dir = g_dir_open(dirname, 0, NULL);
    if (dir != NULL) {
      while ((filename = g_dir_read_name(dir))) {
        if (g_file_test(filename, G_FILE_TEST_IS_DIR)) {
          clean_resolver(filename);
        }
        g_unlink(filename);
      }
      success = TRUE;
    }

    return success;
}

static gboolean mock_resolver() {
    FILE *fd;
    const gchar *dir = "/etc/resolver";
    gchar *host, *port, *filename;
    gboolean success = FALSE;

    if (g_mkdir(dir, 664)) {
        host = get_env("DNS_DNS_HOST");
        port = get_env("DNS_DNS_PORT");
        filename = get_env("DNS_DOMAIN");

        if (host == NULL || port == NULL) { return FALSE; }

        filename = g_strjoin(G_DIR_SEPARATOR_S, dir, filename, NULL);
        fd = fopen(filename, "w");

        if (fd != NULL) {
          fprintf(fd, "nameserver %s.%s\n", host, port);
          fclose(fd);
        } else {
          fprintf(stderr, "Unable to write: %s\n", filename);
        }

        g_free(host);
        g_free(port);
        g_free(filename);
    }

    return success;
}

int main (int argc, char **argv) {
    g_test_init (&argc, &argv, NULL);

    g_test_add_func("/test/gethostbyname_unknown_name", test_gethostbyname_unknown_name);
    g_test_add_func("/test/resolver_by_server", test_resolver_by_server);

    return g_test_run ();

    clean_resolver("/etc/resolver");
    mock_resolver();
    /*g_test_add_func("/test/gethostbyname", test_gethostbyname);*/

    /*GDir *dir;*/
    /*GError *error = NULL;*/
    /*const gchar *filename;*/
    /*dir = g_dir_open("/etc/resolver", 0, &error);*/
    /*g_assert ((dir == NULL && error != NULL) || (dir != NULL && error == NULL));*/
    /*if (error != NULL) {*/
      /*// Report error to user, and free error*/
      /*fprintf (stderr, "Unable to read dir: %s\n", error->message);*/
      /*g_error_free (error);*/
    /*} else {*/
      /*// Use file contents*/
      /*g_assert (dir != NULL);*/

      /*while ((filename = g_dir_read_name(dir)))*/
        /*printf("%s\n", filename);*/

      /*g_dir_close(dir);*/
    /*}*/

    /*g_test_add_func("/test/gethostbyname2", test_gethostbyname2);*/
    /*g_test_add_func("/test/gethostbyname2_inet6", test_gethostbyname2_inet6);*/
}
