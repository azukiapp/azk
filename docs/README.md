# azk documentation

This documentation is made using Gitbook.

To start contributing:

### Prepare your environment

```sh
azk nvm npm install
azk nvm gitbook install content
azk nvm gitbook build   content
```

### Start server

```sh
# if you have node and gitbook installed
gitbook serve content

# this will work if you have azk instaled
azk nvm gitbook serve content
```

Now you can open [http://localhost:4000]. :)

## Deploying

Before deploying you must create a file named `.env` or copy and update `.env.sample`

```ini
AWS_ACCESS_KEY_ID=XXXXXXXXXXXXXX
AWS_SECRET_KEY=XXXXXXXXXXXXXXXXX
AWS_BUCKET_PROD=[bucket to prod deploy]
AWS_BUCKET_STAGE=[bucket to stage deploy]
MIXPANEL_TOKEN=XXXXXXXXXXXXXXXXX
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
azk nvm gulp deploy-stage
azk nvm gulp deploy-prod
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

For that to work, you'll also need to go to your .zshrc file and uncomment the line:

DISABLE_AUTO_TITLE="true"

And go to iTerm -> Preferences -> Appearance -> Window & Tab Titles and uncheck everything.

If you're using a Mac, use Cmd + Shift + 4, then press Space and Left-click to take the screenshot of the terminal. Use the azkdemo application found [here](https://github.com/azukiapp/azkdemo).