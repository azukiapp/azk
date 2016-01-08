import { _, t, os } from 'azk';

var BASE_CODE_ERROR     = 1;
var MANIFEST_CODE_ERROR = 2;
var SYSTEMS_CODE_ERROR  = 3;
var IMAGES_CODE_ERROR   = 4;
var AGENT_CODE_ERROR    = 5;
var SPAWN_CODE_ERROR    = 6;

export { BASE_CODE_ERROR };
export { MANIFEST_CODE_ERROR };
export { SYSTEMS_CODE_ERROR };
export { IMAGES_CODE_ERROR };
export { AGENT_CODE_ERROR };
export { SPAWN_CODE_ERROR };

function copyOwnFrom(target, source) {
  Object.getOwnPropertyNames(source).forEach(function(propName) {
    Object.defineProperty(target, propName,
      Object.getOwnPropertyDescriptor(source, propName)
    );
  });
  return target;
}

function AzkError(translation_key) {
  var superInstance = Error.apply(null, [translation_key]);
  copyOwnFrom(this, superInstance);
  this.translation_key = translation_key;

  // if true will report errors to crash report
  this.report = false;
  this.code   = BASE_CODE_ERROR;

  this.__defineGetter__('message', function() {
    return this.toString();
  });
}

AzkError.prototype = Object.create(Error.prototype);
AzkError.prototype.constructor = AzkError;
AzkError.prototype.toString = function() {
  return t('errors.' + this.translation_key, this);
};

export { AzkError };

export class UnknownError extends AzkError {
  constructor(error) {
    super('unknown_error');
    this.error  = typeof(error) == 'undefined' ? 'undefined' : error;
    this.report = true;
  }
}

export class NoInternetConnection extends AzkError {
  constructor() {
    super('no_internet_connection');
  }
}

export class LostInternetConnection extends AzkError {
  constructor(output) {
    super('lost_internet_connection');
    this.output  = output;
  }
}

export class MustAcceptTermsOfUse extends AzkError {
  constructor() {
    super('must_accept_terms_of_use');
    this.code = BASE_CODE_ERROR;
  }
}

export class ImageDoesNotExistError extends AzkError {
  constructor(image) {
    super('image_does_not_exist');
    this.image = image;
  }
}

export class DockerfileNotFound extends AzkError {
  constructor(image) {
    super('dockerfile_not_found');
    this.image = image;
  }
}

export class ProvisionNotFound extends AzkError {
  constructor(image) {
    super('provision_not_found');
    this.image = image;
  }
}

export class InvalidCommandError extends AzkError {
  constructor(command, key = 'invalid_command_error') {
    super(key);
    this.command = command;
    this.report = true;
  }
}

export class DockerBuildError extends AzkError {
  constructor(type, options = {}) {
    super(`docker_build_error.${type}`);
    _.merge(this, options);
    this.report = true;
  }
}

export class ProvisionPullError extends AzkError {
  constructor(image, msg) {
    super('provision_pull_error');
    this.image = image;
    this.msg   = msg;
    this.report = true;
  }
}

export class SystemError extends AzkError {
  constructor(key, system) {
    super(key);
    this.system = system;
    this.code = SYSTEMS_CODE_ERROR;
    this.report = true;
  }
}

export class SystemDependError extends SystemError {
  constructor(system, depend) {
    super('system_depend_error', system);
    this.depend = depend;
    this.report = true;
  }
}

export class SystemRunError extends SystemError {
  constructor(system, container, command, exitCode, log) {
    super('system_run_error', system);
    this.container = container;
    this.command = command;
    this.exitCode = exitCode;
    this.log = log;
    this.report = true;
  }
}

export class SystemNotScalable extends SystemError {
  constructor(system) {
    super('system_not_scalable', system);
    this.report = true;
  }
}

export class RunCommandError extends SystemError {
  constructor(system, command, output) {
    super('run_command_error', system);

    this.command = command;
    this.output  = output;
    this.report = true;
  }
}

export class ImageNotAvailable extends AzkError {
  constructor(system, image) {
    super('image_not_available');
    this.system = system;
    this.image  = image;
    this.code   = IMAGES_CODE_ERROR;
  }
}

export class ManifestRequiredError extends AzkError {
  constructor(cwd) {
    super('manifest_required');

    this.cwd  = cwd;
    this.code = MANIFEST_CODE_ERROR;
  }
}

export class ManifestError extends AzkError {
  constructor(file, err_message, type = 'validate') {
    super('manifest_error');

    this.type = type;
    this.file = file;
    this.err_message = err_message;
    this.code = MANIFEST_CODE_ERROR;
    this.report = true;
  }
}

export class SystemNotFoundError extends AzkError {
  constructor(manifest, system) {
    super('system_not_found');

    this.manifest = manifest;
    this.system   = system;
    this.code     = SYSTEMS_CODE_ERROR;
  }
}

export class NotBeenImplementedError extends AzkError {
  constructor(feature) {
    super('not_been_implemented');

    this.feature = feature;
    this.code    = BASE_CODE_ERROR;
  }
}

export class AgentNotRunning extends AzkError {
  constructor() {
    super('agent_not_running');
    this.code = AGENT_CODE_ERROR;
  }
}

export class OSNotSupported extends AzkError {
  constructor(os) {
    super('os_not_supported');
    this.os = os;
    this.code = AGENT_CODE_ERROR;
  }
}

export class DependencyError extends AzkError {
  constructor(dependencie, data = {}) {
    super(`dependencies.${os.platform()}.${dependencie}`);
    this.code = AGENT_CODE_ERROR;
    _.merge(this, data);
  }
}

export class AgentStartError extends AzkError {
  constructor(error) {
    super('agent_start');

    this.err_message = error.stack || error.toString();
    this.code        = AGENT_CODE_ERROR;
    this.report      = true;
  }
}

export class AgentStopError extends AzkError {
  constructor() {
    super('agent_stop');
    this.report = true;
  }
}

export class VmStartError extends AzkError {
  constructor(timeout, screen) {
    super('vm_start');
    this.timeout = timeout;
    this.screen  = screen;
    this.code = AGENT_CODE_ERROR;
    this.report = true;
  }
}

export class GitCallError extends AzkError {
  constructor(error_type, git_repo, git_branch_tag_commit, git_destination_path, original_error, stack_trace) {
    super('get_project.' + error_type);

    this.git_repo              = git_repo;
    this.git_branch_tag_commit = git_branch_tag_commit;
    this.git_destination_path  = git_destination_path;
    this.original_error        = original_error;
    this.stack_trace           = stack_trace;
    this.code                  = SPAWN_CODE_ERROR;
  }
}

export class ConfigurationInvalidKeyError extends AzkError {
  constructor(key) {
    super('configuration.invalid_key_error');
    this.key   = key;
  }
}
export class ConfigurationInvalidValueRegexError extends AzkError {
  constructor(key, value) {
    super('configuration.invalid_value_regex_error');
    this.key   = key;
    this.value = value;
  }
}
export class ConfigurationVoidValueError extends AzkError {
  constructor(key) {
    super('configuration.void_value_error');
    this.key   = key;
  }
}

export class ConfigurationInvalidValueBooleanError extends AzkError {
  constructor(key, value) {
    super('configuration.invalid_value_boolean_error');
    this.key   = key;
    this.value = value;
  }
}
