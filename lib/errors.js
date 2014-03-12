var util = require('util')
var _    = require('underscore');

function ImageNotExistError(image) {
  this.message = "Image from '" + image + "' not found";
}

function InvalidFileError(file) {
  this.message = "Added file '" + file + "' not found";
}

function InvalidManifestFormatError(file, error) {
  this.message = "Invalid manifest (" + file + ") format: " + error;
  this.stack = this.message
}

util.inherits(ImageNotExistError, Error);
util.inherits(InvalidFileError, Error);
util.inherits(InvalidManifestFormatError, Error);

function ProvisionError() {};

util.inherits(ProvisionError, Error);

function ProvisionNotFound(image) {
  this.message = "Not found '" + image + "' docker image";
}

util.inherits(ProvisionNotFound, ProvisionError);

module.exports = {
  ImageNotExistError: ImageNotExistError,
  InvalidFileError: InvalidFileError,
  InvalidManifestFormatError: InvalidManifestFormatError,
  ProvisionError: ProvisionError,
  ProvisionNotFound: ProvisionNotFound,
}
