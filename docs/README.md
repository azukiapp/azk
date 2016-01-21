# azk documentation

`azk` documentation was built upon Gitbook.

### Starting Gitbook server with azk

```sh
azk start -o && azk logs --follow
```

After a few minutes, `azk` docs will be up and running on [docs-azk.dev.azk.io](docs-azk.dev.azk.io). :)

## Deploying

Before deploying you must create a file called `.env` or copy and update `.env.sample`

```ini
AWS_ACCESS_KEY_ID=XXXXXXXXXXXXXX
AWS_SECRET_KEY=XXXXXXXXXXXXXXXXX
AWS_BUCKET_PROD=[bucket to prod deploy]
AWS_BUCKET_STAGE=[bucket to stage deploy]
GA_UA=UA-XXXXXXXX-X
GA_LEGACY_COOKIE_DOMAIN=azk.io
HOTJAR_ID=XXXXXXX
```

### azk buckets

```sh
# stage
azk-docs-stage

# production
docs.azk.io
```

### Build and deploy

```sh
azk shell -- gulp deploy --stage
azk shell -- gulp deploy --prod
```

#### [! danger !] to remove all files from a bucket use s3cmd

```sh
s3cmd del s3://azk-docs-stage/ --recursive --force
rm .awspublish-azk-docs-stage
```

## Screenshot terminal configuration

_Font_: Inconsolata
_Font-size_: 15pt
_Console columns_: 87
_Shell_: zsh
_Zsh Theme_: edvardm
_iTerm Color_: [Dracula Theme](https://github.com/zenorocha/dracula-theme)

To change the window title for iTerm, you can do

```sh
echo -ne "\033];azk agent start --no-daemon\007"
```

You may also disable (uncheck) the window number by going to iTerm -> Preferences -> Appearance -> Window & Tab title -> Show window number

For that to work, you'll also need to go to your .zshrc file and uncomment the line:

DISABLE_AUTO_TITLE="true"

And go to iTerm -> Preferences -> Appearance -> Window & Tab Titles and uncheck everything.

If you're using a Mac, use Cmd + Shift + 4, then press Space and Left-click to take the screenshot of the terminal. Use the azkdemo application found [here](https://github.com/azukiapp/azkdemo).
