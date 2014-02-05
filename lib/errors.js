var util = require('util')
var _    = require('underscore');

function ImageNotExistError(image) {
  this.message = "Image from '" + image + "' not found";
}

util.inherits(ImageNotExistError, Error);

module.exports = {
  ImageNotExistError: ImageNotExistError
}
