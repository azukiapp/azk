var util   = require('util')
var _      = require('underscore');
var printf = require('printf');

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

function ProvisionPullError(image, msg) {
  this.message = printf("Error in pull docker imagem: %s, msg: %s", image, msg);
}

util.inherits(ProvisionNotFound, ProvisionError);
util.inherits(ProvisionPullError, ProvisionError);

module.exports = {
  ImageNotExistError: ImageNotExistError,
  InvalidFileError: InvalidFileError,
  InvalidManifestFormatError: InvalidManifestFormatError,
  ProvisionError: ProvisionError,
  ProvisionNotFound: ProvisionNotFound,
  ProvisionPullError: ProvisionPullError,
}
