var _    = require('underscore');
var cst  = require('../constants.js');
var i18n = require('i18next');
var path = require('path');
var Q    = require('q');

function init() {
  //var i18n_init = Q.denodeify(i18n.init)
  var deferred = Q.defer();

  i18n.init({
    lng: "en-US",
    resSetPath: path.join(__dirname, "..", "locales", "__lng__", "__ns__.json")
  }, function() {
    deferred.resolve();
  })

  return deferred.promise;
}

module.exports = {
  init: init,
  _:    _,
  t:   i18n.t,
  cst: cst,
  Q: Q,
  pp: function() {
    console.log.apply(console, arguments);
  }
}
