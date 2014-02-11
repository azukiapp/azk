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

module.exports = {
  ImageNotExistError: ImageNotExistError,
  InvalidFileError: InvalidFileError,
}
