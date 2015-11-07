## Deploying to DigitalOcean

When using `azk`, deploying to [DigitalOcean][digital_ocean] is very simple.

First, we'll have to configure the SSH keys on your machine. We'll need them to connect your local machine to your droplet and send your project's files to it. If you don't have SSH keys on your machine yet (or if you aren't sure about it), just follow steps 1 and 2 of [this tutorial](https://help.github.com/articles/generating-ssh-keys/).

Then, add the `deploy` system into you `Azkfile.js`:

```
systems({
  // ...

  deploy: {
    image: {"docker": "azukiapp/deploy-digitalocean"},
    mounts: {
      "/azk/deploy/src" :    path("."),
      "/azk/deploy/.ssh":    path("#{env.HOME}/.ssh"),
      "/azk/deploy/.config": persistent("deploy-config"),
    },
    scalable: {"default": 0, "limit": 0},
  },
  envs: {
    // Add here deployment options
  }
});
```

Next, add the following `http.domains` items to your main system:

```
systems({
  'my-app': {
    // ...
    http: {
      domains: [
        "#{env.HOST_DOMAIN}",
        "#{env.HOST_IP}"
        // ...
      ]
    },
  },

  // ...
});
```

Get a [personal access token](https://cloud.digitalocean.com/settings/applications) *(must be logged in)* from DigitalOcean and put it into a file named `.env`:

```bash
$ cd path/to/the/project
$ echo "DEPLOY_API_TOKEN=YOUR-PERSONAL-ACCESS-TOKEN" >> .env
```

Finally, just run the following:

```bash
$ azk deploy
```

### Additional features

  - **full**: Configures the remote server and deploy the app (default for the first deployment);
  - **fast**: Deploys without configuring the remote server (default for every run after the first deployment);
  - **restart**: Restarts the app on the remote server;
  - **versions**: Lists all versions of the app deployed on the remote server;
  - **rollback [ref]**: Reverts the app to a specified reference (version or git reference -- commit, branch etc.). If no reference is specified, rolls back to the previous version;
  - **ssh**: Connects to the remote server via SSH protocol;
  - **shell**: Start a shell from inside the deploy system container;
  - **clear-cache**: Clears deploy cached configuration;
  - **help**: Print this message.

**Examples:**

```bash
$ azk deploy
$ azk deploy shell
$ azk deploy full
$ azk deploy fast
$ azk deploy versions
$ azk deploy rollback                 # rollback to previous version
$ azk deploy rollback v2              # rollback to version v2
$ azk deploy rollback feature/add     # rollback to branch feature/add
$ azk deploy rollback 880d01a         # rollback to commit 880d01a
$ azk deploy restart
```

### Supported customization

You can customize your deploy settings by adding options into the `envs` object. The available options are:

- **DEPLOY_API_TOKEN**: User's API token in [DigitalOcean](https://cloud.digitalocean.com/settings/applications) *(must be logged in)*;
- **BOX_NAME** (*optional, default: `$AZK_MID || azk-deploy`*): Droplet name;
- **BOX_REGION** (*optional, default: nyc3*): Region where the droplet is allocated. Check all available regions and their slugs [here](https://developers.digitalocean.com/documentation/v2/#list-all-regions);
- **BOX_IMAGE** (*optional, default: ubuntu-14-04-x64*): Image used in the droplet. Default is Ubuntu 14.04 x86-64 and **we strongly recommend you to use it**. Check all available images and their slugs [here](https://developers.digitalocean.com/documentation/v2/#list-all-distribution-images);
- **BOX_SIZE** (*optional, default: 1gb*): Size of the droplet (involves number of CPUs, amount of memory, storage capacity and data traffic). Check all available droplet sizes and their slugs [here](https://developers.digitalocean.com/documentation/v2/#list-all-sizes);
- **BOX_BACKUP** (*optional, default: false*): If `true`, enables DigitalOcean [built-in backups](https://www.digitalocean.com/help/technical/backup/);
- **BOX_PRIVATE_NETWORKING** (*optional, default: false*): If `true`, enables DigitalOcean [built-in private networking](https://www.digitalocean.com/company/blog/introducing-private-networking/);
- **LOCAL_PROJECT_PATH** (*optional, default: /azk/deploy/src*): Project source code path;
- **LOCAL_DOT_SSH_PATH** (*optional, default: /azk/deploy/.ssh*): Path containing SSH keys. If no path is given, a new SSH public/private key pair will be generated;
- **LOCAL_DOT_CONFIG_PATH** (*optional, default: `/azk/deploy/.config`*): Path to be mapped as a persistent folder on Azkfile.js. Used to cache deploy information;
- **REMOTE_USER** (*optional, default: git*): Username created (or used if it exists) in the remote server to deploy files and run the app;
- **GIT_REF** (*optional, default: master*): Git reference (branch, commit SHA1 or tag) to be deployed;
- **AZK_DOMAIN** (*optional, default: azk.dev.io*): azk domain in the current namespace;
- **HOST_DOMAIN** (*optional*): Domain name which you'll use to access the remote server;
- **AZK_RESTART_COMMAND** (*optional, default: azk restart -R*): command to executed after each git push;
- **REMOTE_PROJECT_PATH_ID** (*optional*): By default, the project will be placed at */home/`REMOTE_USER`/`REMOTE_PROJECT_PATH_ID`* (i.e., `REMOTE_PROJECT_PATH`) in the remote server. If no value is given, a random id will be generated;
- **REMOTE_PROJECT_PATH** (*optional*): The path where the project will be stored in the remote server. If no value is given, it will be */home/`REMOTE_USER`/`REMOTE_PROJECT_PATH_ID`*;
- **RUN_SETUP** (*optional, default: true*): Boolean variable that defines if the remote server setup step should be run;
- **RUN_CONFIGURE** (*optional, default: true*): Boolean variable that defines if the remote server configuration should be run;
- **RUN_DEPLOY** (*optional, default: true*): Boolean variable that defines if the deploy step should be run;
- **DISABLE_ANALYTICS_TRACKER** (*optional, default: false*): Boolean variable that defines either azk should track deploy anonymous data or not;
- **ENV_FILE** (*optional, default: `.env`*): The `.env file` path that will be copied to remote server.

!INCLUDE "../../links.md"
