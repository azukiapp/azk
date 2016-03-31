# PHP / Wordpress / Mysql / phpMyAdmin

### Gerando o Azkfile.js

```sh
$ cd wordpress-folder
$ azk init
```

### Rodando a aplicação

Para iniciar o ambiente de desenvolvimento

```sh
$ azk start -o && azk logs --follow

### Configurando o Wordpress
Renomeie o arquivo wp-config-sample.php para wp-config.php
E atualize os dados de conexão com o banco para:
```sh
define('DB_NAME', getenv('MYSQL_DATABASE'));
define('DB_USER', getenv('MYSQL_USER'));
define('DB_PASSWORD', getenv('MYSQL_PASSWORD'));
define('DB_HOST', getenv('MYSQL_HOST') . ':' . getenv('MYSQL_PORT'));
```
Atualize seu Azkfile.js de acordo com o exemplo abaixo.

### Exemplos

#### PHP-FPM + MySQL + phpMyAdmin

!INCLUDE "../../common/azkfilejs/php_wordpress_mysql.md"
