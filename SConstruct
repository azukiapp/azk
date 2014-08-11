
# Set options and env
env = Environment(CFLAGS = "-fPIC -Wall -Werror -ggdb")
env.ParseConfig("pkg-config --cflags --libs glib-2.0")
env.ParseConfig("pkg-config --cflags --libs libcares")

# Test
env.Program("build/test", ["src/resolver.c", "src/test.c"])

# Library
so = env.SharedLibrary("build/libnss_resolver", ["src/nss.c"])
env.InstallAs('/usr/lib/libnss_resolver.so.2', so)
env.Alias('install', '/usr/lib')
