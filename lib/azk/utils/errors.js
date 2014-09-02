"use strict";
var __moduleName = "src/utils/errors";
var printf = require('printf');
var path = require('path');
var t = require('azk').t;
var BASE_CODE_ERROR = 1;
var MANIFEST_CODE_ERROR = 2;
var SYSTEMS_CODE_ERROR = 3;
var IMAGES_CODE_ERROR = 4;
var AGENT_CODE_ERROR = 5;
;
var AzkError = function AzkError(translation_key) {
  this.translation_key = translation_key;
};
($traceurRuntime.createClass)(AzkError, {
  get message() {
    return this.toString();
  },
  toString: function() {
    return t('errors.' + this.translation_key, this);
  }
}, {}, Error);
var ImageNotExistError = function ImageNotExistError(image) {
  $traceurRuntime.superCall(this, $ImageNotExistError.prototype, "constructor", ['image_not_exist']);
  this.image = image;
};
var $ImageNotExistError = ImageNotExistError;
($traceurRuntime.createClass)(ImageNotExistError, {}, {}, AzkError);
var ProvisionNotFound = function ProvisionNotFound(image) {
  $traceurRuntime.superCall(this, $ProvisionNotFound.prototype, "constructor", ['provision_not_found']);
  this.image = image;
};
var $ProvisionNotFound = ProvisionNotFound;
($traceurRuntime.createClass)(ProvisionNotFound, {}, {}, AzkError);
var InvalidOptionError = function InvalidOptionError(option) {
  var key = arguments[1] !== (void 0) ? arguments[1] : 'invalid_option_error';
  $traceurRuntime.superCall(this, $InvalidOptionError.prototype, "constructor", [key]);
  this.option = option;
};
var $InvalidOptionError = InvalidOptionError;
($traceurRuntime.createClass)(InvalidOptionError, {}, {}, AzkError);
var InvalidValueError = function InvalidValueError(option, value) {
  $traceurRuntime.superCall(this, $InvalidValueError.prototype, "constructor", [option, "invalid_value_error"]);
  this.value = value;
};
var $InvalidValueError = InvalidValueError;
($traceurRuntime.createClass)(InvalidValueError, {}, {}, InvalidOptionError);
var ProvisionPullError = function ProvisionPullError(image, msg) {
  $traceurRuntime.superCall(this, $ProvisionPullError.prototype, "constructor", ['provision_pull_error']);
  this.image = image;
  this.msg = msg;
};
var $ProvisionPullError = ProvisionPullError;
($traceurRuntime.createClass)(ProvisionPullError, {}, {}, AzkError);
var RequiredOptionError = function RequiredOptionError(option) {
  $traceurRuntime.superCall(this, $RequiredOptionError.prototype, "constructor", ['required_option_error']);
  this.option = option;
};
var $RequiredOptionError = RequiredOptionError;
($traceurRuntime.createClass)(RequiredOptionError, {}, {}, AzkError);
var SystemError = function SystemError(key, system) {
  $traceurRuntime.superCall(this, $SystemError.prototype, "constructor", [key]);
  this.system = system;
  this.code = SYSTEMS_CODE_ERROR;
};
var $SystemError = SystemError;
($traceurRuntime.createClass)(SystemError, {}, {}, AzkError);
var SystemDependError = function SystemDependError(system, depend) {
  $traceurRuntime.superCall(this, $SystemDependError.prototype, "constructor", ['system_depend_error', system]);
  this.depend = depend;
};
var $SystemDependError = SystemDependError;
($traceurRuntime.createClass)(SystemDependError, {}, {}, SystemError);
var SystemRunError = function SystemRunError(system, container, command, exitCode, log) {
  $traceurRuntime.superCall(this, $SystemRunError.prototype, "constructor", ['system_run_error', system]);
  this.container = container;
  this.command = command;
  this.exitCode = exitCode;
  this.log = log;
};
var $SystemRunError = SystemRunError;
($traceurRuntime.createClass)(SystemRunError, {}, {}, SystemError);
var SystemNotScalable = function SystemNotScalable(system) {
  $traceurRuntime.superCall(this, $SystemNotScalable.prototype, "constructor", ['system_not_scalable', system]);
};
var $SystemNotScalable = SystemNotScalable;
($traceurRuntime.createClass)(SystemNotScalable, {}, {}, SystemError);
var RunCommandError = function RunCommandError(system, command, output) {
  $traceurRuntime.superCall(this, $RunCommandError.prototype, "constructor", ['run_command_error', system]);
  this.command = command;
  this.output = output;
};
var $RunCommandError = RunCommandError;
($traceurRuntime.createClass)(RunCommandError, {}, {}, SystemError);
var ImageNotAvailable = function ImageNotAvailable(system, image) {
  $traceurRuntime.superCall(this, $ImageNotAvailable.prototype, "constructor", ['image_not_available']);
  this.system = system;
  this.image = image;
  this.code = IMAGES_CODE_ERROR;
};
var $ImageNotAvailable = ImageNotAvailable;
($traceurRuntime.createClass)(ImageNotAvailable, {}, {}, AzkError);
var ManifestRequiredError = function ManifestRequiredError(cwd) {
  $traceurRuntime.superCall(this, $ManifestRequiredError.prototype, "constructor", ['manifest_required']);
  this.cwd = cwd;
  this.code = MANIFEST_CODE_ERROR;
};
var $ManifestRequiredError = ManifestRequiredError;
($traceurRuntime.createClass)(ManifestRequiredError, {}, {}, AzkError);
var ManifestError = function ManifestError(file, err_message) {
  $traceurRuntime.superCall(this, $ManifestError.prototype, "constructor", ['manifest_error']);
  this.file = file;
  this.err_message = err_message;
  this.code = MANIFEST_CODE_ERROR;
};
var $ManifestError = ManifestError;
($traceurRuntime.createClass)(ManifestError, {}, {}, AzkError);
var SystemNotFoundError = function SystemNotFoundError(manifest, system) {
  $traceurRuntime.superCall(this, $SystemNotFoundError.prototype, "constructor", ['system_not_found']);
  this.manifest = manifest;
  this.system = system;
  this.code = SYSTEMS_CODE_ERROR;
};
var $SystemNotFoundError = SystemNotFoundError;
($traceurRuntime.createClass)(SystemNotFoundError, {}, {}, AzkError);
var NotBeenImplementedError = function NotBeenImplementedError(feature) {
  $traceurRuntime.superCall(this, $NotBeenImplementedError.prototype, "constructor", ['not_been_implemented']);
  this.feature = feature;
  this.code = BASE_CODE_ERROR;
};
var $NotBeenImplementedError = NotBeenImplementedError;
($traceurRuntime.createClass)(NotBeenImplementedError, {}, {}, AzkError);
var AgentNotRunning = function AgentNotRunning() {
  $traceurRuntime.superCall(this, $AgentNotRunning.prototype, "constructor", ['agent_not_running']);
  this.code = AGENT_CODE_ERROR;
};
var $AgentNotRunning = AgentNotRunning;
($traceurRuntime.createClass)(AgentNotRunning, {}, {}, AzkError);
var AgentStartError = function AgentStartError(error) {
  $traceurRuntime.superCall(this, $AgentStartError.prototype, "constructor", ['agent_start']);
  this.__error = error;
  this.code = AGENT_CODE_ERROR;
};
var $AgentStartError = AgentStartError;
($traceurRuntime.createClass)(AgentStartError, {get error() {
    return this.__error.stack || this.__error;
  }}, {}, AzkError);
module.exports = {
  get BASE_CODE_ERROR() {
    return BASE_CODE_ERROR;
  },
  get MANIFEST_CODE_ERROR() {
    return MANIFEST_CODE_ERROR;
  },
  get SYSTEMS_CODE_ERROR() {
    return SYSTEMS_CODE_ERROR;
  },
  get IMAGES_CODE_ERROR() {
    return IMAGES_CODE_ERROR;
  },
  get AGENT_CODE_ERROR() {
    return AGENT_CODE_ERROR;
  },
  get AzkError() {
    return AzkError;
  },
  get ImageNotExistError() {
    return ImageNotExistError;
  },
  get ProvisionNotFound() {
    return ProvisionNotFound;
  },
  get InvalidOptionError() {
    return InvalidOptionError;
  },
  get InvalidValueError() {
    return InvalidValueError;
  },
  get ProvisionPullError() {
    return ProvisionPullError;
  },
  get RequiredOptionError() {
    return RequiredOptionError;
  },
  get SystemError() {
    return SystemError;
  },
  get SystemDependError() {
    return SystemDependError;
  },
  get SystemRunError() {
    return SystemRunError;
  },
  get SystemNotScalable() {
    return SystemNotScalable;
  },
  get RunCommandError() {
    return RunCommandError;
  },
  get ImageNotAvailable() {
    return ImageNotAvailable;
  },
  get ManifestRequiredError() {
    return ManifestRequiredError;
  },
  get ManifestError() {
    return ManifestError;
  },
  get SystemNotFoundError() {
    return SystemNotFoundError;
  },
  get NotBeenImplementedError() {
    return NotBeenImplementedError;
  },
  get AgentNotRunning() {
    return AgentNotRunning;
  },
  get AgentStartError() {
    return AgentStartError;
  },
  __esModule: true
};
//# sourceMappingURL=errors.js.map