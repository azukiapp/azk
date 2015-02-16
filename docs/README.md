# Azk documentation

This documentation is made using Gitbook.

### prepare your environment

```sh
azk nvm npm install
azk nvm gitbook install content
azk nvm gitbook build   content
```

### start server

```sh
# if you have node and gitbook installed
gitbook serve content

# this you work if you have azk instaled
azk nvm gitbook serve content
```

Now you can open [http://localhost:4000] to give this as being the result

## Screenshot for information

_Font_: Inconsolata
_Font-size_: 15pt
_Console columns_: 87
_Shell_: zsh
_Zsh Theme_: edvardm

## Deploying

Before deploy you must create a file `.env` or copy and update `.env.sample`

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

### build and deploy

```sh
azk nvm gulp deploy-stage
azk nvm gulp deploy-prod
```

#### [! danger !] to remove all files from a bucket use s3cmd

```sh
s3cmd del s3://azk-docs-stage/ --recursive --force
rm .awspublish-azk-docs-stage
```
