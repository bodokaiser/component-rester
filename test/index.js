var assert = require('assert');
var rester = require('../lib');

var app = require('./server').listen(3000);

describe('rester(url)', function() {

  var client;

  describe('Event: "error"', function(done) {

    it('should be emitted on network error', function(done) {
      rester.once('error', function(error) {
        assert(error instanceof Error);

        done();
      });
      rester('http://localhost:1234/foobar').find();
    });

  });

  describe('Event: "status"', function() {

    it('should be emitted on each request', function(done) {
      rester.once('status', function(status) {
        assert(status === 200);

        done();
      });
      rester('http://localhost:3000/products').find();
    });

  });

  describe('rester.use(plugin)', function() {

    it('should register plugin on each instance', function() {
      rester.use(function() {});

      assert(rester('http://localhost').plugins.length === 1);
    });

    it('should be called before each request', function(done) {
      rester.use(function(req) {
        assert(req.set && req.get);

        done();
      });

      rester('http://localhost:3000/products').find();
    });

  });

  describe('client.find([query, callback])', function() {

  });

  describe('client.findOne(query[, callback])', function() {

  });

  describe('client.persist(model[, callback])', function() {

  });

  describe('client.remove(model[, callback])', function() {

  });

});