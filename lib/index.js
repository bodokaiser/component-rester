try {
  var emitter = require('emitter');
} catch(e) {
  var emitter = require('component-emitter');
}
var rester  = require('./rester');

var plugins = [];

module.exports = function(url) {
  var client = new rester(url);

  client.on('error', emitError);
  client.on('status', emitStatus);

  plugins.forEach(client.use, client);

  return client;
};

emitter(module.exports);

module.exports.use = function(plugin) {
  if (typeof plugin !== 'function') {
    throw new Error('"plugin" must be a function.');
  }

  plugins.push(plugin);

  return module.exports;
};

module.exports.Rester = rester;

function emitError(error) {
  module.exports.emit('error', error);
}

function emitStatus(status, body, res) {
  module.exports.emit('status', status, body, res);
}