var emitter    = require('component-emitter');
var superagent = require('superagent');

function Rester(url, options) {
  this.resource = url || '/';

  this.plugins = [];
}

emitter(Rester.prototype);

Rester.prototype.use = function(plugin) {
  this.plugins.push(plugin);

  return this;
};

Rester.prototype.find = function(query, callback) {
  var request = superagent.get(this.resource);

  if (typeof query === 'function') {
    callback = query;
  } else {
    request.query(query);
  }

  var self = this;
  return exec(this, request, function(res) {
    if (callback) return callback(res.ok, res.body, res);

    self.emit('find', res.ok, res.body, res);
  });
};

Rester.prototype.findOne = function(query, callback) {
  if (~['string', 'number'].indexOf(typeof query)) {
    var id = query;

    query = null;
  } else {
    var id = query.id;

    delete query.id;
  }

  var request = superagent.get(this.resource + '/' + id).query(query);

  var self = this;
  return exec(this, request, function(res) {
    if (callback) return callback(res.ok, res.body, res);

    self.emit('findOne', res.ok, res.body, res);
  });
};

Rester.prototype.persist = function(model, callback) {
  if (model.id) {
    var request = superagent.put(this.resource + '/' + model.id);
  } else {
    var request = superagent.post(this.resource);
  }

  request.send(model);

  var self = this;
  return exec(this, request, function(res) {
    if (callback) return callback(res.ok, res.body, res);

    self.emit('persist', res.ok, res.body, res);
  });
};

Rester.prototype.destroy = function(model, callback) {
  if (~['string', 'number'].indexOf(typeof model)) model = { id: model };

  var request = superagent.del(this.resource + '/' + model.id);

  var self = this;

  return exec(this, request, function(res) {
    if (callback) return callback(res.ok, res.body, res);

    self.emit('destroy', res.ok, res.body, res);
  });
};

module.exports = Rester;

function exec(rester, request, callback) {
  rester.plugins.forEach(function(plugin) {
    plugin.call(rester, request);
  });
  request.end(function(err, res) {
    if (err) return rester.emit('error', err);

    rester.emit('status', res.status, res.body, res);

    callback(res);
  });

  return rester;
}
