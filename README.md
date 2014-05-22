# component-rester

Your sweet REST client based on
[superagent](https://github.com/visionmedia/superagent).

## Usage

    var rester = require('rester');

    var client = rester('/products');

    client.on('error', function(error) {
      // handle error in application or view
    });
    client.on('response', function(response) {
      // handle 4xx and 5xx statuses via view
    });

    // will do a GET /products?filter[name]=Bag and return a request object
    client.find({ filter: { name: 'Bag' } })
      .accept('json')
      .end(function(res) {
        // handle response
      });

    // will do a GET /products and directly assign the callback to .end()
    client.find(function(res) {
      // handle response
    });

    // will do a PUT /products/123
    client.persist({ id: 123, name: 'book' });


## Install

Preferable with [component](https://github.com/component/component)

    $ component install bodokaiser/component-rester

or with [npm](https://github.com/npm/npm)

    $ npm install --save bodokaiser-rester

## Documentation

The `Rester` prototype is an instance of `component-emitter` with some
additional API sugar for HTTP rest on superagent.

### rester(url)

Will return an instance of `Rester` which will be bound to specified `url`.
This means that all requests will be prefixed to the `url`.

### rester.use(plugin)

rester.use(function(request) {
  request.set('Authorization', 'Bearer ' + sessionStorage.get('token'));
});

Will register a plugin on each `Rester` instance. A plugin basically appends
logic to the superagents `request` before `request.end` is called. You can
use it for authorization (e.g. JSON-Web-Tokens).

### Class: Rester

#### Event: "error"

    rester.on('error', function(error) {
      // lets do it the easy way
      throw error;
    });

Will be emitted each time a superagent error occurs (e.g. "network error").

Intended for centralized error management. For example you could render an
error message through notifications however you are not forced to do this out
of each single request.

#### Event: "response"

    rester.on('response', function(response) {
      if (!response.ok) return view.notify('This was not okay.');
    });

Will be emitted on each successful response. Though you could use this to
omit traditional callbacks it is more likely to use the `response` event to
handle non-successful status codes.

#### rester.find([query, callback])

    // does a GET /<endpoint>
    client.find(function(response) {
      // do something with superagents response object
    });

    // does a GET /<endpoint>?limit=10
    client.find({ limit: 10 }, function(response) {
      // do something with superagents response object
    });

    client.find({ limit: 5 }, function(error, response) {
      // as we just decorate superagent you can copy its API.
      // providing two arguments will give you the error object
    });

    // or append logic on the returned request object
    client.find()
      .auth('foo', 'bar')
      .accept('json')
      .end(function(response) {
        // handle response
      });


Will do a `GET` request against the specified endpoint where optional `query`
is used as query string parameter and the optional `callback` executed on
success (non-error). If no callback is provided it will return a `request`.

#### client.findOne(query[, callback])

    // does a GET /<endpoint>/123?include=true
    client.findOne({ id: 123, include: true }).end();

Will do a `GET` request against the subresource of the specified endpoint. The
subresource is either the `id` property of the `query` hash or if `query` is a
string or number then this. If you do not provide a `callback` a `request` is
returned.

#### client.persist(model[, callback])

    // does a POST /<endpoint>
    client.persist({ name: 'Joe' }, function(error, response) {
      // handle error and response
    });

    // does a PUT /<endpoint>/<model.id>
    client.persist({ id: 123, name: 'Joe' }, function(response) {
      // handle response
    });

    // preferred in most cases as we do not get any data in the response
    client.persist({ id: 123, name: 'Joe' }).end();

Either does a `POST` request if no `id` is present in the provided `model` or
a `PUT` if so. If you provide no `callback` you will get a `request` back.

#### client.destroy(model[, callback])

    // does a DELETE /<endpoint>/123
    client.destroy({ id: 123 }).end();

    // also does a DELETE /<endpoint/123
    client.destroy('123').end();

Will send a `DELETE` request to a subresource on endpoint. It will either use
the `id` property of `model` or it will just use `model` if string or number.

## License

Copyright 2014 Bodo Kaiser <i@bodokaiser.io>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
