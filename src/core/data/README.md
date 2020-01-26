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

Still looks fine and useful, but if we want to create more classes for other data instances we need to create some kind of superclass for avoiding "copy-paste" of code lines. Also, the super class may improve our API with adding some extra functionality, such as support for socket events, middlewares, etc. And this is exactly what "core/data" module does.

## Default interface

The "core/data" module provides a default interface for any data providers. If you class implements it, then you can use it as a data provider with any V4Fire modules. This interface is pretty similar with the upper example of a data class, but realizes more common API. Let's take a look for it.

**core/data/interface**

```ts
import { EventEmitterLike } from 'core/async';
import { CreateRequestOptions, RequestQuery, RequestMethod, RequestResponse, RequestBody } from 'core/request';
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

Please notice that the default V4Fire implementation of a data provider by default sends events for "upd", "add", "del" requests.
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

The default implementation of data providers have association between HTTP request methods and the provider methods:

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

But you allow to rewrite it in in your subclass.

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
  baseDeLURL = 'user/add';
}
```

#### Middlewares

You can specify a sequence of middlewares to the provider. For example, we need to append authorization headers for all requests.

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
