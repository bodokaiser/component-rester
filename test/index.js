var chai       = require('chai');
var rester     = require('../lib');
var superagent = require('superagent');

var app = require('./server');

before(function() {
  app.listen(3000);
});

describe('Class: Rester', function() {

  var client;

  describe('new Rester(options)', function() {

    it('should set "url" to "/"', function() {
      client = new rester.Rester();

      chai.expect(client).to.have.property('url').to.equal('/');
    });

    it('should use "url" from options', function() {
      client = new rester.Rester({ url: '/foo' });

      chai.expect(client).to.have.property('url').to.equal('/foo');
    });

    it('should set "plugins" to array', function() {
      client = new rester.Rester();

      chai.expect(client).to.have.property('plugins').to.be.an('array');
      chai.expect(client).to.have.property('plugins').to.be.empty;
    });

    it('should use "plugins" from options', function() {
      client = new rester.Rester({ plugins: [function() {}] });

      chai.expect(client).to.have.property('plugins').to.be.an('array');
      chai.expect(client).to.have.property('plugins').to.have.length(1);
    });

  });

  describe('Event: "error"', function(done) {

    it('should be emitted on network error', function(done) {
      client = new rester.Rester({ url: 'http://localhost:1234/foobar' });

      client.once('error', function(error) {
        chai.expect(error).to.be.instanceof(Error);

        done();
      });
      client.find().end();
    });

  });

  beforeEach(function() {
    client = new rester.Rester({ url: 'http://localhost:3000/products' });
  });

  describe('Event: "response"', function() {

    it('should be emitted on request with callback', function(done) {
      client.once('response', function(response) {
        chai.expect(response).to.be.instanceof(superagent.Response);

        done();
      });
      client.find(function(response) {});
    });

    it('should be emitted on request without callback', function(done) {
      client.once('response', function(response) {
        chai.expect(response).to.be.instanceof(superagent.Response);

        done();
      });
      client.find().end();
    });

  });

  describe('rester.use(plugin)', function() {

    it('should be called before each request', function(done) {
      client.use(function(request) {
        chai.expect(request).to.be.instanceof(superagent.Request);

        done();
      });
      client.find().end();
    });

  });

  describe('client.find([query, callback])', function() {

    it('should return request', function(done) {
      client.find().end(function(response) {
        chai.expect(response).to.be.instanceof(superagent.Response);
        chai.expect(response.body).to.eql(app.products);
        chai.expect(response.req.path).to.eql('/products');

        done();
      });
    });

    it('should execute callback', function(done) {
      client.find(function(response) {
        chai.expect(response).to.be.instanceof(superagent.Response);
        chai.expect(response.body).to.eql(app.products);
        chai.expect(response.req.path).to.eql('/products');

        done();
      });
    });

    it('should use query and return request', function(done) {
      client.find({ limit: 5 }).end(function(response) {
        chai.expect(response).to.be.instanceof(superagent.Response);
        chai.expect(response.body).to.eql(app.products);
        chai.expect(response.req.path).to.eql('/products?limit=5');

        done();
      });
    });

    it('should use query and exec callback', function(done) {
      client.find({ limit: 5 }, function(response) {
        chai.expect(response).to.be.instanceof(superagent.Response);
        chai.expect(response.body).to.eql(app.products);
        chai.expect(response.req.path).to.eql('/products?limit=5');

        done();
      });
    });

  });

  describe('client.findOne(query[, callback])', function() {

    it('should return request at "query"', function(done) {
      client.findOne('1').end(function(response) {
        chai.expect(response).to.be.instanceof(superagent.Response);
        chai.expect(response.body).to.eql(app.products[0]);
        chai.expect(response.req.path).to.eql('/products/1');

        done();
      });
    });

    it('should execute callback at "query"', function(done) {
      client.findOne('1', function(response) {
        chai.expect(response).to.be.instanceof(superagent.Response);
        chai.expect(response.body).to.eql(app.products[0]);
        chai.expect(response.req.path).to.eql('/products/1');

        done();
      });
    });

    it('should return request at "query.id"', function(done) {
      client.findOne({ id: 1, include: true }).end(function(response) {
        chai.expect(response).to.be.instanceof(superagent.Response);
        chai.expect(response.body).to.eql(app.products[0]);
        chai.expect(response.req.path).to.eql('/products/1?include=true');

        done();
      });
    });

    it('should execute callback at "query.id"', function(done) {
      client.findOne({ id: 1, include: true }, function(response) {
        chai.expect(response).to.be.instanceof(superagent.Response);
        chai.expect(response.body).to.eql(app.products[0]);
        chai.expect(response.req.path).to.eql('/products/1?include=true');

        done();
      });
    });

  });

  describe('client.persist(model[, callback])', function() {

    it('should return PUT request', function(done) {
      var product = app.products[1];

      product.price += 1.22;

      client.persist(product).end(function(response) {
        chai.expect(response).to.be.instanceof(superagent.Response);
        chai.expect(response.req.path).to.eql('/products/2');
        chai.expect(response.req.method).to.eql('PUT');

        done();
      });
    });

    it('should return POST request', function(done) {
      var product = { name: 'book', price: 9.99 };

      client.persist(product).end(function(response) {
        chai.expect(response).to.be.instanceof(superagent.Response);
        chai.expect(response.req.path).to.eql('/products');
        chai.expect(response.req.method).to.eql('POST');

        done();
      });
    });

    it('should execute callback after PUT', function(done) {
      var product = app.products[1];

      product.price += 1.22;

      client.persist(product, function(response) {
        chai.expect(response).to.be.instanceof(superagent.Response);
        chai.expect(response.req.path).to.eql('/products/2');
        chai.expect(response.req.method).to.eql('PUT');

        done();
      });
    });

    it('should execute callback after POST', function(done) {
      var product = { name: 'book', price: 9.99 };

      client.persist(product, function(response) {
        chai.expect(response).to.be.instanceof(superagent.Response);
        chai.expect(response.req.path).to.eql('/products');
        chai.expect(response.req.method).to.eql('POST');

        done();
      });
    });

  });

  describe('client.destroy(model[, callback])', function() {

    it('should return request and use "model"', function(done) {
      var product = app.products[0].id;

      client.destroy(product).end(function(response) {
        chai.expect(response).to.be.instanceof(superagent.Response);
        chai.expect(response.req.path).to.eql('/products/' + product);
        chai.expect(response.req.method).to.eql('DELETE');

        done();
      });
    });

    it('should execute callback and use "model"', function(done) {
      var product = app.products[0].id;

      client.destroy(product, function(response) {
        chai.expect(response).to.be.instanceof(superagent.Response);
        chai.expect(response.req.path).to.eql('/products/' + product);
        chai.expect(response.req.method).to.eql('DELETE');

        done();
      });
    });

    it('should return request and use "model.id"', function(done) {
      var product = app.products[0];

      client.destroy(product).end(function(response) {
        chai.expect(response).to.be.instanceof(superagent.Response);
        chai.expect(response.req.path).to.eql('/products/' + product.id);
        chai.expect(response.req.method).to.eql('DELETE');

        done();
      });
    });

    it('should execute callback and use "model.id"', function(done) {
      var product = app.products[0];

      client.destroy(product, function(response) {
        chai.expect(response).to.be.instanceof(superagent.Response);
        chai.expect(response.req.path).to.eql('/products/' + product.id);
        chai.expect(response.req.method).to.eql('DELETE');

        done();
      });
    });

  });

});