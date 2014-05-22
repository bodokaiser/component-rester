var emitter    = require('component-emitter');
var superagent = require('superagent');

function Rester(options) {
  options = options || {};

  this.url     = options.url || '/';
  this.plugins = options.plugins || [];
}

emitter(Rester.prototype);

Rester.prototype.use = function(plugin) {
  this.plugins.push(plugin);

  return this;
};

Rester.prototype.find = function(query, callback) {
  if (typeof query === 'function') callback = query;
  if (typeof query !== 'object') query = {};

  var request = superagent.get(this.url);

  return execRequest(request.query(query), callback, this);
};

Rester.prototype.findOne = function(query, callback) {
  if (typeof query === 'string') {
    var id = query;
    query = null;
  } else {
    var id = query.id;
    delete query.id;
  }

  var request = superagent.get(generateUrl(this.url, id));

  return execRequest(request.query(query), callback, this);
};

Rester.prototype.persist = function(model, callback) {
  var method = ((model && model.id) ? 'PUT' : 'POST').toLowerCase();

  var request = superagent[method](generateUrl(this.url, model.id));

  return execRequest(request.send(model), callback, this);
};

Rester.prototype.destroy = function(model, callback) {
  var model = (~['string', 'number'].indexOf(typeof model)) ? model : model.id;

  var request = superagent.del(generateUrl(this.url, model));

  return execRequest(request, callback, this);
};

module.exports = Rester;


function generateUrl(resource, ident) {
  if (!ident) return resource;

  return resource + '/' + ident;
}

function execPlugins(request, rester) {
  rester.plugins.forEach(function(plugin) {
    plugin(request);
  });
}

function execRequest(request, callback, rester) {
  execPlugins(request, rester);

  request.once('error', function(error) {
    rester.emit('error', error);
  });
  request.once('end', function() {
    // here we have an API difference between the superagent node
    // version used by browserify and the browser version used by component
    if (!request.xhr) {
      var response = new superagent.Response(request, request.res);
    } else {
      var response = new superagent.Response(request);
    }

    rester.emit('response', response);
  });

  if (!callback) return request;

  request.end(callback);

  return rester;
}