import os

# Set clang options by env
env = Environment(CC = "clang", CFLAGS = "-Wall -Werror")

# Output colors
env['ENV']['TERM'] = os.environ['TERM']

# Symlink builder
# http://stackoverflow.com/a/6415507/469463
env.Append(BUILDERS = {
    "Symlink" : Builder(action = "ln -s ${SOURCE.file} ${TARGET.file}", chdir = True),
    'Download': Builder(action = "wget --continue ${URL} -O ${TARGET}", chdir = True),
    'Unpack'  : Builder(action = "tar -${FLAGS} ${SOURCE.file}", chdir = True, target_factory = env.fs.Dir)
})

# Install options
name      = 'libnss_resolver'
version   = os.popen("git describe --abbrev=0 --tags").read()
version   = version.strip().replace("v", "")
lib_name  = '%s.so.%s' % (name, version)

# Build folder
build_dir = os.environ.get('BUILD_FOLDER', "./build")
env['ENV']['BUILD_FOLDER'] = build_dir

# cdefines
DEBUG=""
cppdefines = []
for key, value in ARGLIST:
    if key == 'define':
        cppdefines.append(value)
        if (value == "DEBUG"):
            DEBUG="-g"
env.Append(CPPDEFINES = cppdefines)

# dependencie cmocka
cmocka_version  = "0.4.1"
cmocka_url      = "https://open.cryptomilk.org/attachments/download/42/cmocka-%s.tar.xz" % cmocka_version
cmocka_file     = "%s/cmocka-%s.tar.xz" % (build_dir, cmocka_version)
cmocka_folder   = "%s/cmocka-%s" % (build_dir, cmocka_version)

cmocka_script = """
  cd $SOURCE; mkdir -p ./build;
  cd $SOURCE/build; cmake ../;
  cd $SOURCE/build; make install;
"""

cmocka_file   = env.Download(cmocka_file, None, URL = cmocka_url)
cmocka_folder = env.Unpack(cmocka_folder, cmocka_file, FLAGS = "xJf")
cmocka = env.Command("/usr/local/lib/libcmocka.so", cmocka_folder, Action(cmocka_script));

# Dependencie cares
cares_version  = "1_11_0-rc1"
cares_url      = "https://github.com/azukiapp/c-ares/releases/download/%s/c-ares-%s.tar.gz" % (cares_version, cares_version)
cares_file     = "%s/c-ares-%s.tar.gz" % (build_dir, cares_version)
cares_folder   = "%s/c-ares-%s" % (build_dir, cares_version)

cares_script = """
  cd $SOURCE; if [ ! -f Makefile ]; then ./configure --disable-shared --enable-static --disable-dependency-tracking; fi
  cd $SOURCE; make;
  cp $SOURCE/.libs/libcares.a $TARGET;
"""

env.Download(cares_file, None, URL = cares_url)
env.Unpack(cares_folder, cares_file, FLAGS = "zxf")
cares = env.Command("%s/libcares.a" % build_dir, cares_folder, Action(cares_script));

# Library
so = env.SharedLibrary("%s/libnss_resolver" % build_dir, Glob("src/*c"),
    LIBS      = [cares],
    CFLAGS    = ("%s -I%s" % (DEBUG, cares_folder))
)

install_dirs = {
    'pack' : ARGUMENTS.get('pack_prefix', '%s/libnss/usr/lib' % build_dir),
    'local': ARGUMENTS.get('prefix', '/usr/lib'),
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

test_bin = "%s/test" % build_dir
test_app = env.Program(test_bin, ["src/resolver.c", "src/files.c", Glob("test/*.c")] + so_local + cmocka,
                      LIBS      = [cmocka, cares],
                      CFLAGS    = ("%s -I/usr/local/include -I%s -I%s/include" % (DEBUG, cares_folder, cmocka_folder[0])),
                      LINKFLAGS = "-Wl,--no-as-needed -lrt -lcmocka")

test_run = env.Alias("run-test", cares + cmocka + test_app,
    Action("echo '\x1b[2J\x1b[0;0f'; valgrind --suppressions=./valgrind.supp ${VALGRIND_OPTS} %s" % test_bin)
)
AlwaysBuild(test_run)

# Alias
env.Alias('cares'  , cares)
env.Alias('cmocka' , cmocka)
env.Alias('test'   , cares + cmocka + test_app)
env.Alias('pack'   , cares + so_pack)
env.Alias('install', cares + ['/azk/lib'])
env.Alias('local-install', cares + ['/usr/lib'])
