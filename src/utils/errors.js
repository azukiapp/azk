var printf = require('printf');
var path   = require('path');
import { t } from 'azk';

var BASE_CODE_ERROR     = 1;
var MANIFEST_CODE_ERROR = 2;
var SYSTEMS_CODE_ERROR  = 3;
var IMAGES_CODE_ERROR   = 4;
var AGENT_CODE_ERROR    = 5;

export {
  BASE_CODE_ERROR,
  MANIFEST_CODE_ERROR,
  SYSTEMS_CODE_ERROR ,
  IMAGES_CODE_ERROR  ,
  AGENT_CODE_ERROR,
}

export class AzkError extends Error {
}

export class ImageNotExistError extends AzkError {
  constructor(image) {
    this.message = `Image from '${image}' not found`;
  }
}

export class ProvisionNotFound extends AzkError {
  constructor(image) {
    this.message = `Not found '${image}' docker image`;
  }
}

export class ProvisionPullError extends AzkError {
  constructor(image, msg) {
    this.message = `Error in pull docker imagem: ${image}, msg: ${msg}`;
  }
}

export class InvalidOptionError extends AzkError {
  constructor(option) {
    this.message = `Invalid argument option: ${option}`;
  }
}

export class InvalidValueError extends InvalidOptionError {
  constructor(option, value) {
    this.option  = option;
    this.value   = value;
    this.message = `Invalid value: ${value} in option ${option}`;
  }
}

export class TError extends AzkError {
  constructor(translation_key) {
    this.translation_key = translation_key;
  }

  get message() {
    return this.toString();
  }

  toString() {
    return t('errors.' + this.translation_key, this);
  }
}

export class RequiredOptionError extends TError {
  constructor(option) {
    super('required_option_error');
    this.option  = option;
  }
}

export class SystemDependError extends TError {
  constructor(system, depend) {
    super('system_depend_error');
    this.system = system;
    this.depend = depend;
    this.code   = SYSTEMS_CODE_ERROR;
  }
}

export class ImageNotAvailable extends TError {
  constructor(system, image) {
    super('image_not_available');
    this.system = system;
    this.image  = image;
    this.code   = IMAGES_CODE_ERROR;
  }
}

export class RunCommandError extends TError {
  constructor(command, output) {
    super('run_command_error');

    this.command = command;
    this.output  = output;
    this.code    = SYSTEMS_CODE_ERROR;
  }
}

export class ManifestRequiredError extends TError {
  constructor(cwd) {
    super('manifest_required');

    this.cwd  = cwd;
    this.code = MANIFEST_CODE_ERROR;
  }
}

export class ManifestError extends TError {
  constructor(file, err_message) {
    super('manifest_error');

    this.file = file;
    this.err_message = err_message;
    this.code = MANIFEST_CODE_ERROR;
  }
}

export class SystemNotFoundError extends TError {
  constructor(manifest, system) {
    super('system_not_found');

    this.manifest = manifest;
    this.system   = system;
    this.code     = SYSTEMS_CODE_ERROR;
  }
}

export class NotBeenImplementedError extends TError {
  constructor(feature) {
    super('not_bee_implemented');

    this.feature = feature;
    this.code    = BASE_CODE_ERROR;
  }
}

export class AgentStartError extends TError {
  constructor(error) {
    super('agent_start');

    this.error = error;
    this.code  = AGENT_CODE_ERROR;
  }
}
