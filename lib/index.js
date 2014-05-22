var Rester = require('./rester');

var plugins = [];

module.exports = function(url) {
  return new Rester({
    url: url,
    plugins: plugins
  });
};

module.exports.use = function(plugin) {
  if (typeof plugin !== 'function') {
    throw new Error('"plugin" must be a function.');
  }

  plugins.push(plugin);

  return module.exports;
};

module.exports.Rester = Rester;