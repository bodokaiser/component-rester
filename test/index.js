var chai   = require('chai');
var rester = require('../lib');

var app = require('./server');

before(function() {
  app.listen(3000);
});

describe('rester(url)', function() {

  var client;

  describe('Event: "error"', function(done) {

    it('should be emitted on network error', function(done) {
      rester.once('error', function(error) {
        chai.expect(error).to.be.instanceof(Error);

        done();
      });
      rester('http://localhost:1234/foobar').find();
    });

  });

  describe('Event: "status"', function() {

    it('should be emitted on each request', function(done) {
      rester.once('status', function(status) {
        chai.expect(status).to.equal(200);

        done();
      });
      rester('http://localhost:3000/products').find();
    });

  });

  describe('rester.use(plugin)', function() {

    it('should register plugin on each instance', function() {
      rester.use(function() {});

      chai.expect(rester('http://localhost').plugins).to.have.length(1);
    });

    it('should be called before each request', function(done) {
      var called = 0;
      rester.use(function(req) {
        chai.expect(req).to.have.property('set').and.to.be.a('function');
        chai.expect(req).to.have.property('get').and.to.be.a('function');

        if (!called++) done();
      });

      rester('http://localhost:3000/products').find();
    });

  });

  beforeEach(function() {
    client = rester('http://localhost:3000/products');
  });

  describe('client.find([query, callback])', function() {

    it('should emit a "find" event', function(done) {
      client.once('find', function(ok, body, respond) {
        chai.expect(ok).to.be.true;
        chai.expect(body).to.eql(app.products);
        chai.expect(respond).to.have.deep.property('req.path')
          .and.to.equal('/products')

        done();
      });
      client.find();
    });

    it('should emit a "find" event and use query', function(done) {
      client.once('find', function(ok, body, respond) {
        chai.expect(ok).to.be.true;
        chai.expect(body).to.eql(app.products);
        chai.expect(respond).to.have.deep.property('req.path')
          .and.to.equal('/products?limit=5')

        done();
      });
      client.find({ limit: 5 });
    });

    it('should exec the callback', function(done) {
      client.find(function(ok, body, respond) {
        chai.expect(ok).to.be.true;
        chai.expect(body).to.eql(app.products);
        chai.expect(respond).to.have.deep.property('req.path')
          .and.to.equal('/products')

        done();
      });
    });

    it('should exec the callback and use query', function(done) {
      client.find({ limit: 5 }, function(ok, body, respond) {
        chai.expect(ok).to.be.true;
        chai.expect(body).to.eql(app.products);
        chai.expect(respond).to.have.deep.property('req.path')
          .and.to.equal('/products?limit=5')

        done();
      });
    });

  });

  describe('client.findOne(query[, callback])', function() {

    it('should use id in query object', function(done) {
      client.findOne({ id: 1 }, function(ok, body, respond) {
        chai.expect(ok).to.be.true;
        chai.expect(body).to.eql(app.products[0]);
        chai.expect(respond).to.have.deep.property('req.path')
          .and.to.equal('/products/1');

        done();
      });
    });

    it('should use id in query object and query as query', function(done) {
      client.findOne({ id: 1, include: true }, function(ok, body, respond) {
        chai.expect(ok).to.be.true;
        chai.expect(body).to.eql(app.products[0]);
        chai.expect(respond).to.have.deep.property('req.path')
          .and.to.equal('/products/1?include=true');

        done();
      });
    });

    it('should use query as id', function(done) {
      client.findOne('1', function(ok, body, respond) {
        chai.expect(ok).to.be.true;
        chai.expect(body).to.eql(app.products[0]);
        chai.expect(respond).to.have.deep.property('req.path')
          .and.to.equal('/products/1');

        done();
      });
    });

    it('should request with id and emit "findOne"', function(done) {
      client.once('findOne', function(ok, body, respond) {
        chai.expect(ok).to.be.true;
        chai.expect(body).to.eql(app.products[0]);
        chai.expect(respond.req.path).to.equal('/products/1');

        done();
      });
      client.findOne('1');
    });

    it('should request with query object and emit "findOne"', function(done) {
      client.once('findOne', function(ok, body, respond) {
        chai.expect(ok).to.be.true;
        chai.expect(body).to.eql(app.products[1]);
        chai.expect(respond.req.path).to.equal('/products/2?include=true');

        done();
      });
      client.findOne({ id: 2, include: true });
    });

  });

  describe('client.persist(model[, callback])', function() {

    it('should request PUT model', function(done) {
      app.products[1].price += 1.99;

      client.persist(app.products[1], function(ok, body, respond) {
        chai.expect(ok).to.be.true;
        chai.expect(respond.req.path).to.equal('/products/2');

        done();
      });
    });

    it('should request POST model', function(done) {
      client.persist({ name: 'car' }, function(ok, body, respond) {
        chai.expect(ok).to.be.true;
        chai.expect(respond.req.path).to.equal('/products');

        done();
      });
    });

    it('should emit "persist" event', function(done) {
      app.products[1].price += 1.99;

      client.once('persist', function(ok, body, respond) {
        chai.expect(ok).to.be.true;
        chai.expect(respond.req.path).to.equal('/products/2');

        done();
      });
      client.persist(app.products[1]);
    });

  });

  describe('client.destroy(model[, callback])', function() {

    it('should request DELETE to model.id', function(done) {
      client.destroy(app.products[2], function(ok, body, respond) {
        chai.expect(ok).to.be.true;
        chai.expect(respond.req.path).to.equal('/products/3');

        done();
      });
    });

    it('should emit "destroy" event', function(done) {
      var product = app.products[0];

      client.once('destroy', function(ok, body, respond) {
        chai.expect(ok).to.be.true;
        chai.expect(respond.req.path).to.equal('/products/' + product.id);

        done();
      });
      client.destroy(product);
    });

  });

});