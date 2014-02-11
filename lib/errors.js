var util = require('util')
var _    = require('underscore');

function ImageNotExistError(image) {
  this.message = "Image from '" + image + "' not found";
}

function InvalidFileError(file) {
  this.message = "Added file '" + file + "' not found";
}

util.inherits(ImageNotExistError, Error);
util.inherits(InvalidFileError, Error);

function ProvisionError() {};

util.inherits(ProvisionError, Error);

function ProvisionNotFound(image) {
  this.message = "Not found '" + image + "' docker image";
}

util.inherits(ProvisionNotFound, ProvisionError);

module.exports = {
  ImageNotExistError: ImageNotExistError,
  InvalidFileError: InvalidFileError,
  ProvisionError: ProvisionError,
  ProvisionNotFound: ProvisionNotFound,
}
