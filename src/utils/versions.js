import { lazy_require } from 'azk';
var lazy = lazy_require({
  semver: 'semver',
});

/**
 * Versions: Abstraction above the [semver](https://www.npmjs.com/package/semver).
 */

var Versions = {
  /**
   * compare version by regex
   * @param  {Regex}    regex     Regular expression to compare with content;
   * @param  {String}   content   String with version to parse;
   * @return {Array}              collection of versions;
   */
  match(regex, content) {
    if (!(regex instanceof RegExp)) {
      throw new Error(`regex ${regex} is not instance of \`RegExp\``);
    }
    // fix cached regex
    regex = new RegExp(regex);
    var match = regex.exec(content) || [];
    match = match.slice(1, match.length)
    var versions = [];
    match.forEach((version) =>{
      if (version) {
        version = this.parse(version);
        versions.push(version);
      }
    });
    return versions;
  },

  /**
   * parse version from string
   * @param  {String}      context   context contents version
   * @return {String|Null}           parsed version
   */
  parse(context, depth=3) {
    var match   = context.match(/([0-9.]+)/gm);
    var version = (match && match[0]);
    if (version) {
      // force valid format: eg: 1.0 => 1.0.0 (with depth=3)
      var splited = version.split('.');
      for(var i = 0; i < depth; i++) {
        splited[i] = splited[i] || '0';
      }
      version = splited.join('.');
      version = lazy.semver.clean(version);
    }
    return version;
  }
};

export default Versions;
