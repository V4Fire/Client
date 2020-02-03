# core/data

This module provides API for creation an abstraction under data — a data provider.
The provider grants methods for accessing and modifying data that is represented as one logical instance.

For example, we need to create API for a user in our application. Let's start with a simple REST architecture:

1. `GET user/:id` returns an object of user fields by the specified user id:

```js
import request from 'core/request';
request('user/1');
```

```json
{
  "id": 1,
  "name": "Andrey",
  "age": 30
}
```

2. `PUT user/:id` modifies a user by the specified id with some provided data and returns new data:

```js
import request from 'core/request';
request('user/1', {method: 'PUT', body: {"age": 31}});
```

```json
{
  "id": 1,
  "name": "Andrey",
  "age": 31
}
```

3. `DELETE user/:id` deletes a user by the specified id:

```js
import request from 'core/request';
request('user/1', {method: 'DELETE'});
```

4. `POST user` creates a new user with the specified data and returns it:

```js
import request from 'core/request';
request('user', {method: 'POST', body: {"name": "Andrey", "age": 30}});
```

```json
{
  "id": 2,
  "name": "Andrey",
  "age": 30
}
```

All of these handlers is associated with one data model that represents a user. Knowing this, we can a class for this model.

```js
import request from 'core/request';

class User {
  url = 'user/';

  async get(id) {
    return (await request(this.url + id)).data;
  }

  async upd(id, body) {
    return (await request(this.url + id, {method: 'PUT', body})).data;
  }

  async del(id) {
    return (await request(this.url + id, {method: 'DELETE'})).data;
  }

  async add(body) {
    return (await request(this.url, {method: 'POST', body})).data;
  }
}
```

This is very naive implementation, but it works. Also, we need to create some API for providing events of the provider, which allows to notificate an application if data was changed.

```js
import request from 'core/request';
import { EventEmitter2 as EventEmitter } from 'eventemitter2';

class User {
  url = 'user/';
  emitter = new EventEmitter();

  async get(id) {
    return (await request(this.url + id)).data;
  }

  async upd(id, body) {
    const {data} = await request(this.url + id, {method: 'PUT', body});
    this.emitter.emit('upd', data);
    return data;
  }

  async del(id) {
    const {data} = await request(this.url + id, {method: 'DELETE'});
    this.emitter.emit('del', data);
    return data;
  }

  async add(body) {
    const {data} = await request(this.url, {method: 'POST', body});
    this.emitter.emit('add', data);
    return data;
  }
}
```

Still looks fine and useful, but if we want to create more classes for other data instances we need to create some kind of a superclass for avoiding "copy-paste" of code lines. Also, the super class may improve our API with adding some extra functionality, such as support for socket events, middlewares, etc. And this is exactly what "core/data" module does.

## Default interface

The "core/data" module provides a default interface for any data providers. If you class implements it, then you can use it as a data provider with any V4Fire modules. This interface is pretty similar with the upper example of a data class, but realizes more common API. Let's take a look for it.

**core/data/interface**

```ts
import { EventEmitterLike } from 'core/async';
import {

  CreateRequestOptions,
  RequestQuery,
  RequestMethod,
  RequestResponse,
  RequestBody

} from 'core/request';

import { ModelMethod } from 'core/data/interface';
export * from 'core/data/interface/types';

export default interface Provider {
  readonly providerName: string;

  readonly emitter: EventEmitterLike;

  name(): CanUndef<ModelMethod>;
  name(value: ModelMethod): Provider;

  method(): CanUndef<RequestMethod>;
  method(value: RequestMethod): Provider;

  base(): string;
  base(value: string): Provider;

  url(): string;
  url(value: string): Provider;

  dropCache(): void;

  get<T = unknown>(query?: RequestQuery, opts?: CreateRequestOptions<T>): RequestResponse;

  peek<T = unknown>(query?: RequestQuery, opts?: CreateRequestOptions<T>): RequestResponse;

  post<T = unknown>(body?: RequestBody, opts?: CreateRequestOptions<T>): RequestResponse;

  add<T = unknown>(body?: RequestBody, opts?: CreateRequestOptions<T>): RequestResponse;

  upd<T = unknown>(body?: RequestBody, opts?: CreateRequestOptions<T>): RequestResponse ;

  del<T = unknown>(body?: RequestBody, opts?: CreateRequestOptions<T>): RequestResponse;
}
```

Much of these methods look familiar, but also we have some new method and properties:

1. `providerName` contains a full name of the provider.
2. `name` — a pair of get/set methods for providing "logical" meaning about a request:

```js
// Will emit "init" event, which contains the data, after successfully receiving
myProvider.name('init').get('foo');
```

Please notice, that the default V4Fire implementation of a data provider by default sends events for "upd", "add", "del" requests.
These events have the same name with a methods that produce it.

3. `method` — a pair of get/set methods for providing a type of a HTTP request:

```js
// The request uses POST method for getting data
myProvider.method('POST').get('foo');
```

4. `base` — a pair of get/set methods for providing a base URL for requests:

```js
// The request is addressed for https://google.com/foo
myProvider.base('https://google.com').get('foo');
```

5. `url` — a pair of get/set methods for providing URL for requests:

```js
// The request is addressed for https://google.com/foo
myProvider.url('https://google.com').get('foo');

// We can combine .base() and .url():
// The request is addressed for https://google.com/bla/baz
myProvider.base('https://google.com').url('bla/baz').get('foo');
```

6. `dropCache` — a method that drops any request cache.

7. `peek` — a request that logically is similar with checking of accessibility of API, by default it uses HEAD.

8. `post` — a request that sends to a server some data without any logical representation, by default it uses POST.

## Default implementation

In addition to the base interface of data providers V4Fire provides an implementation, which grants some extra functionality for more flexible using.

```js
import Provider from 'core/provider';

export default class User extends Provider {
  baseURL = 'user/:id';
}

const user = new User();
user.get({id: 1}).then((data) => {
  console.log(data);
})
```

### Registering a data provider as multiton

You can register your data provider by a name in the global storage. For that case you should use the special decorator "provider".

```js
import Provider, { provider, providers } from 'core/provider';

@provider
export default class User extends Provider {
  baseURL = 'user/:id';
}

console.log(providers['User']);
```

The name for registering is taken from a class name of the provider. Also, you can declare a namespace that is concatenated with the name.

```js
import Provider, { provider, providers } from 'core/provider';

@provider('base')
export default class User extends Provider {
  baseURL = 'user/:id';
}

console.log(providers['base.User']);
```

It can be useful for providing data providers to components as input properties:

```xml
<my-component dataProvider="base.User"></my-component>
```

### Decorating a request function
#### Request methods

The default implementation of a data provider have association between HTTP request methods and the provider methods:

```js
{
  /**
   * Default HTTP request method for the "get" method
   */
  getMethod: RequestMethod = 'GET';

  /**
   * Default HTTP request method for the "peek" method
   */
  peekMethod: RequestMethod = 'HEAD';

  /**
   * Default HTTP request method for the "add" method
   */
  addMethod: RequestMethod = 'POST';

  /**
   * Default HTTP request method for the "upd" method
   */
  updMethod: RequestMethod = 'PUT';

  /**
   * Default HTTP request method for the "del" method
   */
  delMethod: RequestMethod = 'DELETE';
}
```

But you allow to rewrite it in your subclass.

```js
import Provider, { provider } from 'core/provider';

@provider
export default class User extends Provider {
  baseURL = 'user/:id';
  getMethod = 'POST';
}
```

#### Base URL for requests

Base URL is the start point for URLs of each request. You can provide one universal URL using `baseURL` parameter, but also,
you can specify a base URL for each particular method.

```js
import Provider, { provider } from 'core/provider';

@provider
export default class User extends Provider {
  baseURL = 'user/:id';
  baseAddURL = 'user/add';
  baseDeLURL = 'user/:id/del';
}
```

##### URL interpolation

You can specify dynamically values within a URL string. For this case just add a variable with `:` character before the name.
The values for interpolations is taken from a query object or a request body (if it represented as simple JS object).
After interpolation all values that is used will be dropped from a source object.

#### Middlewares

Middleware is a simple function that is invoked before each request and can modify some request parameters, like adding/removing HTTP headers, etc.
The function takes a request environment:

```ts
{
  ctx: RequestContext<T>;
  opts: CreateRequestOptions<T>;
  globalOpts: GlobalOptions;
}
```

You can specify a sequence of middlewares to the provider, but notice that the order of middlewares depends of a structure that you use (hash is't preserve the order, but arrays/maps do it).

For example, we need to add some authorization header for every request of the provider.

```js
import Provider, { provider } from 'core/provider';

@provider
export default class User extends Provider {
  static middlewares = {
    addSession({opts: {headers}}) {
      headers['Authorization'] = 'bearer myJWTToken';
    }
  };

  baseURL = 'user/:id';
}
```

Basically, a result of a middleware function is ignoring. The exceptions are promises and functions.
If some middleware returns a promise, it will be awaited.
And if at least one of middlewares returns a function, than the result of invoking this function will be returned as the request result.
It can be helpful for organizing mocks of data and other similar cases when you don't want to execute a real request.

```js
import Provider, { provider, Response } from 'core/provider';

@provider
export default class User extends Provider {
  static middlewares = {
    attachMocks() {
      return () => new Response({id: 1, name: 'Andrey'}, {
        status: 200,
        responseType: 'object'
      });
    }
  };

  baseURL = 'user/:id';
}
```

#### Encoders

Encoder is a subtype of a middleware function, but unlike the simple middleware the encoder must returns a value and provides it
to another encoder or a request, which it means that a sequence of encoders are tied with an order of following.
Encoders is using for converting data to another format before submitting it to a request.
For example, you server demands that all request data must be represented as a protobuf value.

```js
import Provider, { provider } from 'core/provider';

@provider
export default class User extends Provider {
  static encoders = {
    upd: [toProtobuf]
  };

  baseURL = 'user/:id';
}
```

Be notice, that unlike of "middlewares" parameter the encoders is separated between a provider methods, which is mean
that you should declare encoders for all you method pipelines.

The encoder function has the signature:

```ts
export interface Encoder<I = unknown, O = unknown> {
  (data: I, params: MiddlewareParams): O;
}
```

Where:

1. `data` is your data;
2. `params` is an environment of your request.

If some encoder returns a promise, it will be awaited.

#### Decoders

Decoder is another subtype of a middleware function, which is pretty similar to "encoder", but unlike the encoder,
it converts data from a server to the provider format.

The decoder function has the signature:

```ts
export interface Encoder<I = unknown, O = unknown> {
  (data: I, params: MiddlewareParams, response: Response): O;
}
```

The first to parameters are equal to the encoder function. The last parameter contains a link to a response object.

```js
import Provider, { provider } from 'core/provider';

@provider
export default class User extends Provider {
  static decoders = {
    get: [fromProtobuf]
  };

  baseURL = 'user/:id';
}
```

If some encoder returns a promise, it will be awaited.

#### Custom request function

For creating a request all providers are used the `core/request` module. And if you need to provide some extra parameters of request, such as "contentType", you can specify a factory for making these requests using the special overload of the request function.

```js
import request from 'core/request';
import Provider, { provider } from 'core/provider';

@provider
export default class User extends Provider {
  static request = request({
    contentType: 'json',
    cacheStrategy: 'forever',
    cacheTTL: (10).seconds()
  });

  baseURL = 'user/:id';
}
```

#### Custom request function

For creating a request all providers are used the `core/request` module. And if you need to provide some extra parameters of request, such as "contentType", you can specify a factory for making these requests using the special overload of the request function.

```js
import request from 'core/request';
import Provider, { provider } from 'core/provider';

@provider
export default class User extends Provider {
  static request = request({
    contentType: 'json',
    cacheStrategy: 'forever',
    cacheTTL: (10).seconds()
  });

  baseURL = 'user/:id';
}
```

#### Interpolation of headers

Headers of a request also have support for interpolation from request data, like "baseURL" have.

```js
import request from 'core/request';
import Provider, { provider } from 'core/provider';

@provider
export default class User extends Provider {
  static request = request({
    header: {
      Accept: '${accept}'
    }
  });

  baseURL = 'user/:id';
}
```

##### Providing an API URL

You can specify a base URL for your server. It can be useful if you have different URLs for development, staging and production.
The API URL is concatenated with base URL of a provider.

```js
import Provider, { provider } from 'core/provider';

@provider
export default class User extends Provider {
  static request = request({
    api: {url: 'https://google.com'}
  });

  baseURL = 'user/:id';
}
```

The value is also can be declared as a function, which is invoking on each request.

```js
import Provider, { provider } from 'core/provider';

@provider
export default class User extends Provider {
  static request = request({
    api: {url: () => USE_PROD ? 'https://google.com' : 'https://dev.google.com'}
  });

  baseURL = 'user/:id';
}
```

And finally, if you specify the default API URL within `core/config/api`, you can provides some chunks of an API URL that is applied to the base.

```js
import Provider, { provider } from 'core/provider';

@provider
export default class User extends Provider {
  static request = request({
    api: {
      domain3: () => () => USE_PROD ? '' : 'dev',
      zone: 'io'
    }
  });

  baseURL = 'user/:id';
}
```

### Composition of providers

You can create a composition of multiple providers, which are fetching in parallel and merging to one data.

```js
import Provider, { provider } from 'core/provider';

@provider
export default class User extends Provider {
  extraProviders = {
    'skils': {
      provider: 'Skills',

    }
  };

  baseURL = 'user/:id';
}
```

### Extending a data provider from another

The data provider is a simple class that implements the special interface. That's why for creating a new provider that is extending parameters from another you should create a simple subclass.

```js
import Provider, { provider } from 'core/provider';

@provider
export class User extends Provider {
  static request = request({
    api: {url: 'https://google.com'}
  });

  static middlewares = {
    addSession({opts: {headers}}) {
      headers['Authorization'] = 'bearer myJWTToken';
    }
  };

  baseURL = 'user/:id';
}

@provider
export class User2 extends User {
  static request = User.request({
    contentType: 'json'
  });

  static middlewares = {
    ...User.middlewares,
    addABHeader({opts: {headers}}) {
      headers['X-AB'] = 'foo';
    }
  };
}
```

### Specifying data mocks

There is a standard middleware for organizing a mechanism of data mocking — "attackMock" middleware (it uses by default).

```js
import Provider, { provider } from 'core/provider';

@provider
export default class User extends Provider {
  static mocks = {
    PUT: [
      {
        body: {
          age: 31
        },

        response: {
          id: 1,
          name: "Andrey",
          age: 31
        }
      }
    ],

    GET: [{
      response: {
        id: 1,
        name: "Andrey",
        age: 30
      }
    }]
  };

  baseURL = 'user/:id';
}
```

Please notice that root keys of mocks are represent HTTP methods, but not provider methods. Values are contain arrays of request objects for matching: the algorithm finds the most suitable option and returns it response. Also supports dynamically casting responses:

```js
import Provider, { provider } from 'core/provider';

@provider
export default class User extends Provider {
  static mocks = {
    GET: [{
      response(params, response) {
        if (!params.opts.query?.id) {
          response.status = 400;
          return;
        }

        response.status = 200;
        return {
          id: 1,
          name: "Andrey",
          age: 30
        };
       }
    }]
  };

  baseURL = 'user/:id';
}
```

And finally, you can use dynamic imports with mocks:

```js
import Provider, { provider } from 'core/provider';

@provider
export default class User extends Provider {
  static mocks = import('mocks/user.json');
  baseURL = 'user/:id';
}
```

#### Enabling data mocks for a provider

By default all data mocks is disabled, but you can enable it just type to a console of a browser:

```js
// Enables mocks for the User provider
setEnv('mock', {patterns: ['User']})

// Enables mocks for all providers
setEnv('mock', {patterns: ['.*']})
```

The values of patterns is converted to RegExp objects and applies to provider names (including namespaces).
Config setting will be stored within a browser local storage.
