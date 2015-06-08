import { _ } from 'azk';
import { UIProxy } from 'azk/cli/ui';
import semver from 'semver';

var example_system = {
  __type  : 'example',
  name    : 'example',
  depends : [],
  shell   : '/bin/bash',
  image   : { docker: '[repository]:[tag]' },
  workdir : '/azk/#{manifest.dir}',
  wait: {
    retry: 20,
    timeout: 1000
  },
  balancer: true,
  command : '# command to run app',
  mounts  : {
    '/azk/#{manifest.dir}': {type: 'path', value: '.'},
  },
  envs: {
    EXAMPLE: 'value'
  }
};

export class BaseRule extends UIProxy {
  constructor(...args) {
    super(...args);

    // { ruleName : version to satisfies }
    // eg:
    // {
    //   'node08' : '>=0.8.0 <0.10.0',
    //   'node010': '>=0.10.0 <0.11.0',
    //   'node012': '<0.8.0 || >=0.11.0',
    // }
    this.version_rules = {};

    // this.type     = "runtime";
    // this.name     = "elixir";
    // this.ruleName = "elixir";
    // this.replaces = ['elixir'];

    this.semver = semver;
  }

  relevantsFiles() {
    throw new Error('Don\'t use \'relevantsFiles\' directly, implements on rule file.');
  }

  /**
   * Return a evidence object
   * @param  {string} path     - Project folder path
   * @param  {content} content - Relevant file content
   * @return {object}          - Evidence object with properties: fullpath, ruleType, name, version and ruleName
   * eg: {
   *   fulpath : "/home/project/",
   *   ruleType: "runtime",
   *   name    : "elixir",
   *   ruleName: "elixir",
   *   version : "1.0.0",
   * }
   */
  getEvidence(path, content) {
    var framework;
    if (this.type === 'framework') {
      framework = this.getFrameworkVersion(content);
      if (!framework) { return null; }
    }

    var version = this.getVersion(content);
    var evidence = {
      fullpath: path,
      ruleType: this.type,
      name    : this.name,
      ruleName: this.getRuleByVersion(version) || this.rule_name,
      version : version,
      replaces: this.replaces,
      framework,
    };
    return evidence;
  }

  getVersion(/*content*/) { return; }
  getFrameworkVersion(/*content*/) { return; }

  /**
   * Find `ruleName` in `version_rules` by `version`
   * @param  {string} version - Valid semver version
   * @return {string} ruleName - Name of rule
   */
  getRuleByVersion(version) {
    if (_.isNull(version) || _.isEmpty(version)) { return; }

    return _.findKey(this.version_rules || {}, (value) => {
      return semver.satisfies(version, value);
    });
  }
}

export { example_system };
