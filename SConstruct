import os

# Set clang options by env
env = Environment(CC = "clang", CFLAGS = "-Wall -Werror")
env.ParseConfig("pkg-config --cflags --libs glib-2.0")

# Output color
env['ENV']['TERM'] = os.environ['TERM']

# Dependencie ares
ares_version = "1_11_0-rc1"
ares_url     = "https://github.com/azukiapp/c-ares/releases/download/%s/c-ares-%s.tar.gz" % (ares_version, ares_version)
ares_file    = "./build/c-ares-%s.tar.gz" % ares_version
ares_folder  = "./build/c-ares-%s" % ares_version

ares_download = """
    mkdir -p ./build >> /dev/null;
    cd ./build; wget --continue %s;
    cd ./build; tar -zxf ../%s;
""" % (ares_url, ares_file)

ares_script = """
    cd $SOURCE; ./configure --disable-shared --enable-static --disable-dependency-tracking;
    cd $SOURCE; make;
    cp $SOURCE/.libs/libcares.a $TARGET;
"""

folder = env.Command(ares_folder, None, Action(ares_download));
ares   = env.Command("./build/libcares.a", folder, Action(ares_script));

# Library
so = env.SharedLibrary("build/libnss_resolver", ["src/nss.c"],
        LINKFLAGS = "-lglib-2.0",
        LIBS=[ares])

# Install options
env.InstallAs('/usr/lib/libnss_resolver.so.2', so)
env.InstallAs('/azk/lib/libnss_resolver.so.2', so)

# Test
env.Program("build/test", ["src/resolver.c", "src/test.c"],
        LIBS      = [ares],
        CFLAGS    = ("-fblocks -I%s" % folder[0]),
        LINKFLAGS = "-lBlocksRuntime -lcmocka")

# Alias
env.Alias('install', '/azk/lib')
env.Alias('local-install', '/usr/lib')
env.Alias('test', 'build/test')
env.Alias('ares', ares);
