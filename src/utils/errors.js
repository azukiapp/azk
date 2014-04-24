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

export class InvalidOptionError extends Error {
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

export class RequiredOptionError extends Error {
  constructor(option) {
    this.option  = option;
    this.message = `Option ${option} is required`;
  }
}
