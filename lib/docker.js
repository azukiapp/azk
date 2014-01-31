var Docker = require('dockerode');
var cst    = require('../constants.js');
var url    = require('url');

// TODO: Add support unix path
var opts = url.parse(cst.DOCKER_HOST);

module.exports = new Docker({
  host: 'http://' + opts.hostname,
  port: opts.port,
})
