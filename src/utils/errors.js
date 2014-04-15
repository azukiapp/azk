var printf = require('printf');

export class ImageNotExistError extends Error {
  constructor(image) {
    this.message = `Image from '${image}' not found`;
  }
}

export class ProvisionNotFound extends Error {
  constructor(image) {
    this.message = `Not found '${image}' docker image`;
  }
}

export class ProvisionPullError extends Error {
  constructor(image, msg) {
    this.message = `Error in pull docker imagem: ${image}, msg: ${msg}`;
  }
}
