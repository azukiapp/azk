import os

# Set clang options by env
env = Environment(CC = "clang", CFLAGS = "-Wall -Werror")

# Output color
env['ENV']['TERM'] = os.environ['TERM']

# cdefines
DEBUG=""
cppdefines = []
for key, value in ARGLIST:
    if key == 'define':
        cppdefines.append(value)
        if (value == "DEBUG"):
            DEBUG="-g"
env.Append(CPPDEFINES = cppdefines)

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

# Symlink builder
# http://stackoverflow.com/a/6415507/469463
builder = Builder(action = "ln -s ${SOURCE.file} ${TARGET.file}", chdir = True)
env.Append(BUILDERS = {"Symlink" : builder})

# Library
so = env.SharedLibrary("build/libnss_resolver", Glob("src/*c"),
    LIBS      = [ares],
    CFLAGS    = ("%s -I%s" % (DEBUG, folder[0]))
)

# Install options
name     = 'libnss_resolver'
version  = os.popen("git describe --abbrev=0 --tags").read()
version  = version.strip().replace("v", "")
lib_name = '%s.so.%s' % (name, version)

install_dirs = {
    'pack' : ARGUMENTS.get('pack_prefix', 'build/libnss/usr/lib'),
    'local': '/usr/lib',
    'azk'  : '/azk/lib'
}

for k,v in install_dirs.items():
    directory = os.path.normpath(v);
    build     = env.InstallAs('%s/%s.so.2' % (directory, name), so)
    globals()['so_' + k] = build

# Test
env['ENV']['TEST_DNS_PORT']   = os.environ['DNS_DNS_PORT']
env['ENV']['TEST_DNS_HOST']   = os.environ['DNS_DNS_HOST']
env['ENV']['TEST_DNS_IP']     = os.environ['DNS_IP']
env['ENV']['TEST_DOMAIN']     = os.environ['DNS_DOMAIN']
env['ENV']['TEST_FIXTURES']   = os.getcwd() + '/test/fixtures/'
env['ENV']['VALGRIND_OPTS']   = ARGUMENTS.get('valgrind', '')
env['ENV']['LD_LIBRARY_PATH'] = '/usr/local/lib'

program = env.Program("build/test", ["src/resolver.c", "src/files.c", Glob("test/*.c")] + so_local + cmocka,
                      LIBS      = [cmocka, ares],
                      CFLAGS    = ("%s -I/usr/local/include -I%s" % (DEBUG, folder[0])),
                      LINKFLAGS = "-lcmocka")

test_run = env.Alias("run-test", [program], Action("echo '\x1b[2J\x1b[0;0f'; valgrind --suppressions=./valgrind.supp ${VALGRIND_OPTS} ./build/test"))
AlwaysBuild(test_run)

# Alias
env.Alias('pack', so_pack);
env.Alias('install', '/azk/lib')
env.Alias('local-install', '/usr/lib')
env.Alias('test', 'build/test')
env.Alias('ares', ares);
env.Alias('cmocka', cmocka);
