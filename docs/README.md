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

Before deploy you must create a file `.env.json`

```js
{
    "AWS_ACCESS_KEY_ID": "XXXXXXXXXXXXXX",
    "AWS_SECRET_KEY":    "XXXXXXXXXXXXXXXXX"
}
```

### azk buckets

```sh
# stage
azk-docs-stage

# production
docs.azk.io
```

### to deploy all files

```sh
AWS_BUCKET=azk-docs-stage ./deploy.sh
```

### to deploy only doc files (fast)

```sh
AWS_BUCKET=azk-docs-stage ./deploy-only-doc.sh
```

#### to remove all file from a bucket use the s3cmd

```sh
s3cmd del s3://azk-docs-stage/ --recursive --force
```
