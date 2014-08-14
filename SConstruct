import os

# Set clang options by env
env = Environment(CC = "clang", CFLAGS = "-Wall -Werror")
env.ParseConfig("pkg-config --cflags --libs glib-2.0")

# Output color
env['ENV']['TERM'] = os.environ['TERM']

def download(url, file, tar_flag):
  return """
    mkdir -p ./build >> /dev/null;
    cd ./build; wget --continue %s;
    cd ./build; tar -%s ../%s;
  """ % (url, tar_flag, file)

# dependencie cmocka
cmocka_version  = "0.4.1"
cmocka_url      = "https://open.cryptomilk.org/attachments/download/42/cmocka-%s.tar.xz" % cmocka_version
cmocka_file     = "./build/cmocka-%s.tar.xz" % cmocka_version
cmocka_folder   = "./build/cmocka-%s" % cmocka_version
cmocka_download = download(cmocka_url, cmocka_file, "xJf")

cmocka_script = """
  cd $SOURCE; mkdir -p ./build;
  cd $SOURCE/build; cmake ../;
  cd $SOURCE/build; make install;
"""

folder = env.Command(cmocka_folder, None, Action(cmocka_download));
cmocka = env.Command("/usr/local/lib/libcmocka.so", folder, Action(cmocka_script));

# Dependencie ares
ares_version  = "1_11_0-rc1"
ares_url      = "https://github.com/azukiapp/c-ares/releases/download/%s/c-ares-%s.tar.gz" % (ares_version, ares_version)
ares_file     = "./build/c-ares-%s.tar.gz" % ares_version
ares_folder   = "./build/c-ares-%s" % ares_version
ares_download = download(ares_url, ares_file, "zxf")

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
env.Program("build/test", ["src/resolver.c", "src/files.c", "src/test.c"],
        LIBS      = [cmocka, ares],
        CFLAGS    = ("-fblocks -I/usr/local/include -I%s" % folder[0]),
        LINKFLAGS = "-lBlocksRuntime -lcmocka")

# Alias
env.Alias('install', '/azk/lib')
env.Alias('local-install', '/usr/lib')
env.Alias('test', 'build/test')
env.Alias('ares', ares);
env.Alias('cmocka', cmocka);
