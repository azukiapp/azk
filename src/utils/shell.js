// https://regex101.com/r/rK1eJ0/6
var regex_envs = /(\\*)(\$(?:(?:[=|-]?([A-Z0-9_]*[A-Z_]+[A-Z0-9_]*)|(?:{[=|-]?([A-Z0-9_]*[A-Z_]+[A-Z0-9_]*)}))))/g;

export function replaceEnvs(str, replace_for = "$1", json = false) {
  return str.replace(regex_envs, (_match, slashes, v1, v2, v3) => {
    var slashes_size = slashes.length / (json ? 2 : 1);
    if (slashes_size % 2 === 0) {
      return `${slashes}${replace_for.replace("$1", v2 || v3)}`;
    } else if (slashes_size) {
      return `${slashes.slice(0, slashes.length - (json ? 2 : 1))}${v1}`;
    } else {
      return _match;
    }
  });
}
