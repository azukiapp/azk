import { log } from 'azk';
import { BaseRule } from 'azk/generator/rules';

export class Rule extends BaseRule {
  constructor(ui) {
    super(ui);
    this.type      = "runtime";
    this.name      = "php_composer";
    this.rule_name = "php_composer";
    this.replaces  = ['php', 'node'];

    // Suggest a docker image
    // http://images.azk.io/#/php-fpm
    this.version_rules = {
      'php_composer-5.5' : '>=5.0.0 <5.6.0',
      // 'php_composer-5.6' : '<5.5.9 || >=5.6.3'
    };
  }

  relevantsFiles() {
    return ['composer.json'];
  }

  getVersion(content) {
    var parsedJson, version;
    try {
      parsedJson = JSON.parse(content);
    } catch (err) {
      log.error('JSON.parse error', err.stack || err);
    }
    if (parsedJson && parsedJson.require && parsedJson.require.php) {
      // remove garbage
      version = parsedJson.require.php.replace(/[^\d\.\*]/g, "");
    }
    return version && this.semver.clean(version);
  }
}
