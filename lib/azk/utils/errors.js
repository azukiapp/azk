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
var AzkError = function AzkError() {
  $traceurRuntime.defaultSuperCall(this, $AzkError.prototype, arguments);
};
var $AzkError = AzkError;
($traceurRuntime.createClass)(AzkError, {}, {}, Error);
var ImageNotExistError = function ImageNotExistError(image) {
  this.message = ("Image from '" + image + "' not found");
};
($traceurRuntime.createClass)(ImageNotExistError, {}, {}, AzkError);
var ProvisionNotFound = function ProvisionNotFound(image) {
  this.message = ("Not found '" + image + "' docker image");
};
($traceurRuntime.createClass)(ProvisionNotFound, {}, {}, AzkError);
var ProvisionPullError = function ProvisionPullError(image, msg) {
  this.message = ("Error in pull docker imagem: " + image + ", msg: " + msg);
};
($traceurRuntime.createClass)(ProvisionPullError, {}, {}, AzkError);
var InvalidOptionError = function InvalidOptionError(option) {
  this.message = ("Invalid argument option: " + option);
};
($traceurRuntime.createClass)(InvalidOptionError, {}, {}, AzkError);
var InvalidValueError = function InvalidValueError(option, value) {
  this.option = option;
  this.value = value;
  this.message = ("Invalid value: " + value + " in option " + option);
};
($traceurRuntime.createClass)(InvalidValueError, {}, {}, InvalidOptionError);
var TError = function TError(translation_key) {
  this.translation_key = translation_key;
};
($traceurRuntime.createClass)(TError, {
  get message() {
    return this.toString();
  },
  toString: function() {
    return t('errors.' + this.translation_key, this);
  }
}, {}, AzkError);
var RequiredOptionError = function RequiredOptionError(option) {
  $traceurRuntime.superCall(this, $RequiredOptionError.prototype, "constructor", ['required_option_error']);
  this.option = option;
};
var $RequiredOptionError = RequiredOptionError;
($traceurRuntime.createClass)(RequiredOptionError, {}, {}, TError);
var SystemDependError = function SystemDependError(system, depend) {
  $traceurRuntime.superCall(this, $SystemDependError.prototype, "constructor", ['system_depend_error']);
  this.system = system;
  this.depend = depend;
  this.code = SYSTEMS_CODE_ERROR;
};
var $SystemDependError = SystemDependError;
($traceurRuntime.createClass)(SystemDependError, {}, {}, TError);
var ImageNotAvailable = function ImageNotAvailable(system, image) {
  $traceurRuntime.superCall(this, $ImageNotAvailable.prototype, "constructor", ['image_not_available']);
  this.system = system;
  this.image = image;
  this.code = IMAGES_CODE_ERROR;
};
var $ImageNotAvailable = ImageNotAvailable;
($traceurRuntime.createClass)(ImageNotAvailable, {}, {}, TError);
var RunCommandError = function RunCommandError(command, output) {
  $traceurRuntime.superCall(this, $RunCommandError.prototype, "constructor", ['run_command_error']);
  this.command = command;
  this.output = output;
  this.code = SYSTEMS_CODE_ERROR;
};
var $RunCommandError = RunCommandError;
($traceurRuntime.createClass)(RunCommandError, {}, {}, TError);
var ManifestRequiredError = function ManifestRequiredError(cwd) {
  $traceurRuntime.superCall(this, $ManifestRequiredError.prototype, "constructor", ['manifest_required']);
  this.cwd = cwd;
  this.code = MANIFEST_CODE_ERROR;
};
var $ManifestRequiredError = ManifestRequiredError;
($traceurRuntime.createClass)(ManifestRequiredError, {}, {}, TError);
var ManifestError = function ManifestError(file, err_message) {
  $traceurRuntime.superCall(this, $ManifestError.prototype, "constructor", ['manifest_error']);
  this.file = file;
  this.err_message = err_message;
  this.code = MANIFEST_CODE_ERROR;
};
var $ManifestError = ManifestError;
($traceurRuntime.createClass)(ManifestError, {}, {}, TError);
var SystemNotFoundError = function SystemNotFoundError(manifest, system) {
  $traceurRuntime.superCall(this, $SystemNotFoundError.prototype, "constructor", ['system_not_found']);
  this.manifest = manifest;
  this.system = system;
  this.code = SYSTEMS_CODE_ERROR;
};
var $SystemNotFoundError = SystemNotFoundError;
($traceurRuntime.createClass)(SystemNotFoundError, {}, {}, TError);
var NotBeenImplementedError = function NotBeenImplementedError(feature) {
  $traceurRuntime.superCall(this, $NotBeenImplementedError.prototype, "constructor", ['not_bee_implemented']);
  this.feature = feature;
  this.code = BASE_CODE_ERROR;
};
var $NotBeenImplementedError = NotBeenImplementedError;
($traceurRuntime.createClass)(NotBeenImplementedError, {}, {}, TError);
var AgentNotRunning = function AgentNotRunning() {
  $traceurRuntime.superCall(this, $AgentNotRunning.prototype, "constructor", ['agent_not_runnnig']);
  this.code = AGENT_CODE_ERROR;
};
var $AgentNotRunning = AgentNotRunning;
($traceurRuntime.createClass)(AgentNotRunning, {}, {}, TError);
var AgentStartError = function AgentStartError(error) {
  $traceurRuntime.superCall(this, $AgentStartError.prototype, "constructor", ['agent_start']);
  this.__error = __error;
  this.code = AGENT_CODE_ERROR;
};
var $AgentStartError = AgentStartError;
($traceurRuntime.createClass)(AgentStartError, {get error() {
    return this.__error.stack || this.__error;
  }}, {}, TError);
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
  get ProvisionPullError() {
    return ProvisionPullError;
  },
  get InvalidOptionError() {
    return InvalidOptionError;
  },
  get InvalidValueError() {
    return InvalidValueError;
  },
  get TError() {
    return TError;
  },
  get RequiredOptionError() {
    return RequiredOptionError;
  },
  get SystemDependError() {
    return SystemDependError;
  },
  get ImageNotAvailable() {
    return ImageNotAvailable;
  },
  get RunCommandError() {
    return RunCommandError;
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