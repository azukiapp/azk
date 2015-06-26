import { log } from 'azk';
import { BaseRule } from 'azk/generator/rules';

export class Rule extends BaseRule {
  constructor(ui) {
    super(ui);
    this.type      = "runtime";
    this.name      = "node";
    this.rule_name = "node";

    // Suggest a docker image
    // http://images.azk.io/#/node
    this.version_rules = {
      'node-0.8' : '>=0.8.0 <0.10.0',
      'node-0.10': '>=0.10.0 <0.11.0',
      'node-0.12': '<0.8.0 || >=0.11.0',
    };
  }

  relevantsFiles() {
    return ['package.json'];
  }

  getVersion(content) {
    var parsedJson, version;
    try {
      parsedJson = JSON.parse(content);
    } catch (err) {
      log.error('JSON.parse error', err.stack || err);
    }
    if (parsedJson && parsedJson.engine) {
      // remove garbage
      version = parsedJson.engine.replace(/[^\d\.]/g, "");
    } else {
      version = parsedJson && parsedJson.engines && parsedJson.engines.node;
    }
    return version && this.semver.clean(version);
  }
}
