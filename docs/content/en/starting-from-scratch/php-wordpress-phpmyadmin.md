# PHP / Wordpress / Mysql / phpMyAdmin

### Creating the Azkfile.js

```sh
$ cd wordpress-folder
$ azk init
```

### Running application

To start the development environment

```sh
$ azk start -o && azk logs --follow
```
### Config the wordpress
Rename the file wp-config-sample.php to wp-config.php
And update the Database connection for: 
```sh
define('DB_NAME', getenv('MYSQL_DATABASE'));
define('DB_USER', getenv('MYSQL_USER'));
define('DB_PASSWORD', getenv('MYSQL_PASSWORD'));
define('DB_HOST', getenv('MYSQL_HOST') . ':' . getenv('MYSQL_PORT'));
```
Update your Azkfile.js according to the example below.
### Examples

#### PHP-FPM + MySQL + phpMyAdmin

!INCLUDE "../../common/azkfilejs/php_wordpress_mysql.md"
