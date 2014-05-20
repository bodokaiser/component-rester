var express = require('express');

var app = express();

app.products = require('./products');

app.post('/products', function(req, res) {
  var body = '';

  req.on('readable', function() {
    body += req.read().toString();
  });
  req.on('end', function() {
    app.products.push(JSON.parse(body));

    res.json(200);
  });
});

app.get('/products', function(req, res) {
  res.json(app.products);
})

app.get('/products/:product', function(req, res) {
  var result = app.products.filter(function(product) {
    return product.id == req.params.product;
  }).pop();

  res.json(result);
});

app.put('/products/:product', function(req, res) {
  var result = app.products.filter(function(product) {
    return product.id == req.params.product;
  }).pop();

  for (var key in req.body) {
    result[key] = req.body[key];
  }

  res.json(200);
});

app.del('/products/:product', function(req, res) {
  var result = app.products.filter(function(product) {
    return product.id == req.params.product;
  }).pop();

  app.products.splice(app.products.indexOf(result), 1);

  res.json(200)
});

module.exports = app;