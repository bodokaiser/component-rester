# component-rester

Your sweet REST client based on superagent.

## Usage

    var rester = require('rester');

    var client = rester('/products');

    client.on('error', function(error) {
      // handle error in application or view
    });
    client.on('find', function(ok, body) {
      // render models in view
    });
    // will do a GET /products?filter[name]=Bag
    client.find({ filter: { name: 'Bag' } });

    // or directly with callback
    client.find({ filter: { name: 'Bag' } }, function(err, res) {
      if (err) throw err;

      // else handle response
    });


## Install

Preferable with [component](https://github.com/component/component)

    $ component install bodokaiser/component-rester

or with [npm](https://github.com/npm/npm)

    $ npm install --save bodokaiser-rester

## Documentation

The exposed function behind `rester` is a factory which will instance the
`Rester` prototype for you. The `Rester` prototype does nothing more then
to add some REST API sugar on superagent. Also by using the reset function
to create instances of `Rester` you can centralize error management and setup
plugins.

### rester(url[, options])

Will return an instance of `Rester` which will be bound to specified `url`.
This means that all requests will be prefixed to the `url`.

The `options` parameter is currently undefined. We may use it in future.

### Event: "error"

    rester.on('error', function(error) {
      // lets do it the easy way
      throw error;
    });

Will be emitted each time a superagent error occurs (e.g. "network error").

Intended for centralized error management. For example you could shutdown your
application on an error or render an error message through notifications
however you are not forced to do this out of each single request.

### Event: "status"

    rester.on('status', function(status, body, res) {
      if (status === 400) return view.notify('There was an error in your data.');
    });

Will be emitted for special status handling.

As for example a `bad request` response is not an error per definition (mostly
it is a validation error) superagent handles them as success. However you
may want to bind to specific 4xx statuses by subscribing to this event.

### rester.use(plugin)

    rester.use(function(request) {
      request.set('Authorization', 'Bearer ' + sesstionStorage.get('token'));
    });

Will register a plugin on each `Rester` instance. A plugin basically appends
logic to the superagents `request` before `request.end` is called. You can
use it for authentorization (e.g. JSON-Web-Tokens) or more.

#### client

Following methods are only available on direct `Rester` instances not on the
global namespace.

#### client.find([query, callback])

    // does a GET /<endpoint>
    client.find(function(ok, body, response) {
      if (!ok) return;

      // use body
    });

    // does a GET /<endpoint>?limit=10
    client.find({ limit: 10 }, function(ok, body, response) {
      if (!ok) return;

      // use body
    });

Will do a `GET` request against the specified endpoint where optional `query`
is used as query string parameter and the optional `callback` executed on
success (non-error) else it will emit a `find` event.

#### client.findOne(query[, callback])

    // does a GET /<endpoint>/123?include=true
    client.findOne({ id: 123, include: true });

    // does a GET /<endpoint>/123
    client.findOne(123);

Will do a `GET` request against the subresource of the specified endpoint. The
subresource is either the `id` property of the `query` hash or if `query` is a
string or number then this. If you do not provide a `callback` a `findOne`
event is emitted.

#### client.persist(model[, callback])

    // does a POST /<endpoint>
    client.persist({ name: 'Joe' });

    // does a PUT /<endpoint>/<model.id>
    client.persist({ id: 123, name: 'Joe' });

Either does a `POST` request if no `id` is present in the provided `model` or
a `PUT` if so. If you provide no `callback` you can listen to the `persist`
event.

#### client.destroy(model[, callback])

    // does a DELETE /<endpoint>/123
    client.destroy({ id: 123 });

    // also does a DELETE /<endpoint/123
    client.destroy('123');

Will send a `DELETE` request to a subresource on endpoint. It will either use
the `id` property of `model` or it will just use `model` if string or number.
Emits a `destroy` event if no `callback` provided.

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
