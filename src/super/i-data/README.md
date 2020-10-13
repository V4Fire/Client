# super/i-data

Before reading this documentation, please see [core/data API](https://v4fire.github.io/Core/modules/src_core_data_index.html).

This module provides a superclass to manage the working of a component and data provider.

## Synopsis

* The component is not used on its own. It is a superclass.

* The component API doesn't support functional or flyweight components.

* The component extends [[iBlock]].

* The component implements [[iProgress]] trait.

## Basic concepts

To select a data provider tied with a component, you need to provide the `dataProvider` prop or set the default value for it.
Mind, the prop value has a string type and contains a provider name from the global pool.
To register a data provider within the global pool, you need to use the `@provider` decorator.

**models/user.ts**

```typescript
import { provider, Provider } from 'core/data';

@provider
export default class User extends Provider {
  /** @override */
  baseURL: string = '/user/:uuid';
}
```

**b-example/b-example.ts**

```typescript
import 'models/user';
import iData, { component, wait } from 'super/i-data/i-data';

@component()
export default class bExample extends iData {
  /** @override */
  dataProvider: string = 'User';
}
```

Or

```
< b-example :dataProvider = 'User'
```

After the loading of data, there is stored within the `db` field.

```
< template v-if = db
  {{ db.someValue }}
```

Every child instance of iData can have no more than one data provider, i.e., you should decompose your data logic between different components,
but not to combine all in one component. This approach produces a more strict code structure that is easy to support and debug.
Also, all pending requests with the same hash are joined, and the final result will bee shared between consumers.
Don't be afraid about the performance decreasing.

```
/// There will be only two real requests because the first two requests are had the same request hash
< b-example :dataProvider = 'User' | :request = {get: {uuid: '1'}}
< b-example :dataProvider = 'User' | :request = {get: {uuid: '1'}}
< b-example :dataProvider = 'User' | :request = {get: {uuid: '2'}}
```

To optimize data loading, you may specify the data caching of a data provider.

```typescript
import { provider, Provider } from 'core/data';
import RestrictedCache from 'core/cache/restricted';

@provider
export default class User extends Provider {
  // Each get request will be cached for 10 minutes,
  // but in the cache can be no more than 15 values
  static request = Provider.request({
    cacheTTL: (10).minutes(),
    cacheStrategy: new RestrictedCache(15)
  });

  /** @override */
  baseURL: string = '/user/:uuid';
}
```

### Composition of data providers

To overcome the limitation of a provider's single instance per component, you can use the special API calls "extra providers".
[See more](https://v4fire.github.io/Core/modules/src_core_data_index.html#composition-of-providers).

#### Remote providers

You can use another component as a data provider, pass the `remoteProvider` prop to it.
After this, the parent component will wait until it is loaded.

```
< b-example :remoteProvider = true | @someEventWithData = onData
```

Or you can use the special component - [[bRemoteProvider]].
The component doesn't have any UI representation and provides a flexible API to use as a remote provider.

```
< b-remote-provider :dataProvider = 'myData' | @change = onData
< b-remote-provider :dataProvider = 'myData' | :field = 'fieldWhenWillBeStoredData'
```

This way is useful when you are using it with the `v-if` directive, but be careful if you want to periodically update data from remote providers:
you can emit a bunch of redundant re-renders. Mind, `bRemoteProvider` is a regular component, and initialization of it takes additional time.
The valid case to use this kind of provider is to submit some data without getting the response, for instance, analytic events.

#### Manual using of remote providers

You free to use data providers that are not tied with your component but remember async wrapping.

```typescript
import User from 'models/user';
import iData, { component, system } from 'super/i-data/i-data';

@component()
export default class bExample extends iData {
  @system(() => new User())
  user!: User;

  getUser(): Promise<UserData> {
    return this.async.request(this.user.get());
  }
}
```

However, it is better to avoid this approach since it can make the code confusing.

## Provider data

Provider data will save into the `db` field. By default, it has an object type, but you can specify it explicitly.

```typescript
import 'models/user';
import iData, { component, wait } from 'super/i-data/i-data';

interface MyData {
  name: string;
  age: number;
}

@component()
export default class bExample extends iData {
  /** @override */
  readonly DB!: MyData;

  /** @override */
  dataProvider: string = 'User';

  getUser(): CanUndef<this['DB']> {
    return this.db;
  }
}
```

### `db` events

| Name          | Description                                          | Payload description          | Payload                |
| ------------- |------------------------------------------------------| -----------------------------|----------------------- |
| `dbCanChange` | There is a possibility of changing the value of `db` | Provider data or `undefined` | `CanUndef<this['DB']>` |
| `dbChange`    | The value of `db` has been changed                   | Provider data or `undefined` | `CanUndef<this['DB']>` |

### Changing of `db`

Before setting a new `db` value, it will be compared with the previous. The new data will be applied only if it not equal to the previous.
To compare, by default is used `Object.fastClone`. This behavior can be canceled by switching the `checkDBEquality` prop to `false`.
Or you can provide a function to compare within this prop.

### Converting provider data

By default, all providers produce immutable data: it helps optimize memory usage, as all components with the same provider share one instance of data.
If a component wants to modify data within `db`, it has to clone the original object.
You can easily do it by calling `valueOf` method from `db` value.

```
this.db = transform(this.db?.valueOf());
```

It works because all providers override the default `valueOf` method of data objects.

#### `dbConverter`

Every child instance of iData has a prop that can transforms data from a provider before saving it to `db`.
You can pass a function or list of functions that will be applied to provider data.

```
< b-example :dataProvider = 'myData' | :dbConverter = convertToComponent
< b-example :dataProvider = 'myData' | :dbConverter = [convertToComponent, convertMore]
```

#### `initRemoteData` and `componentConverter`

Sometimes you want to create a component that can take data directly from a prop or by loading from a data provider.
You can manage this situation by using `sync.link` and `initRemoteData`. See the [[Sync]] class for additional information.

`initRemoteData` is a function that invokes every time the `db` is changed.
You can override it within your component to adopt `db` data to a component field.
Finally, every child instance of iData has a prop that can transform data from a `db` format to a more suitable component field format.
You can pass a function or list of functions that will be applied to `db`.

```typescript
import iData, { component, prop, field } from 'super/i-data/i-data';

export default class bExample extends iData {
  @prop(Object)
  dataProp: MyDataFormat;

  @field((o) => o.sync.link())
  data: MyDataFormat;

  /** @override */
  protected initRemoteData(): CanUndef<MyDataFormat> {
    if (!this.db) {
      return;
    }

    // `convertDBToComponent` will automatically apply `componentConverter` if it provided
    const data = this.convertDBToComponent<MyDataFormat>(this.db);
    return this.data = data;
  }
}
```

```
< b-example :dataProvider = 'myData' | :componentConverter = convertToData
< b-example :dataProvider = 'myData' | :componentConverter = [convertToData, convertMore]
```

## Component initializing

If a component has a data provider, it will ask for data on the initializing stage using `initLoad`.

Till data is loaded, the component will have the `loading` status (`componentStatus`).
After the main provider loading and if any other external providers are loaded, the component will be switched to the `ready` status.

You can use `isReady` to avoid the rendering of template chunks with data before it is loaded.

```
< .&__user-info v-if = isReady
  {{ db.name }}
```

Also, you can use the `@wait` decorator and similar methods within TS files.

```typescript
import 'models/user';
import iData, { component, wait } from 'super/i-data/i-data';

@component()
export default class bExample extends iData {
  /** @override */
  dataProvider: string = 'User';

  @wait('ready')
  getUser(): CanPromise<this['DB']> {
    return this.db;
  }
}
```

### Init events

| Name            | Description                                     | Payload description                 | Payload                                   |
| --------------- |-------------------------------------------------| ------------------------------------|------------------------------------------ |
| `initLoadStart` | The component starts the initial loading        | Options of the loading              | `InitLoadOptions`                         |
| `initLoad`      | The component have finished the initial loading | Loaded data, options of the loading | `CanUndef<this['DB']>`, `InitLoadOptions` |

### Preventing of the initial data loading

By default, if a component has a data provider, it will ask for data on initial loading.
But sometimes you have to manage this process manually. You can use `defaultRequestFilter` to provide a function that can filter any implicit requests,
like initial loading: if the function returns a negative value, the request will be aborted. If the prop is set to `true`,
then all requests without payload will be aborted.

```
< b-example :dataProvider = 'myData' | :defaultRequestFilter = filterRequests
```

## Providing of request parameters

You can provide the `request` prop with data to request by different provider methods to any iData's child component.

```
< b-example :dataProvider = 'MyData' | :request = {get: {id: 1}, upd: [{id: 1, name: newName}, {responseType: 'blob'}]}
```

The `get` data is used to the initial request.

You can also set up a component that it will emit some provider request when occurring mutation of the specified properties.
Just use `sync.object` and `requestParams`. See the [[Sync]] class for additional information.

```typescript
import 'models/api/user';
import { Data } from 'models/api/user/interface';

import iData, { component, field, TitleValue, RequestParams } from 'super/i-data/i-data';

@component()
export default class bExample extends iData {
  /** @override */
  readonly DB!: Data;

  /** @override */
  readonly dataProvider: string = 'api.User';

  /**
   * User name
   */
  @field()
  name: string = 'Bill';

  /**
   * Some query parameter
   */
  @field()
  show: boolean = true;

  /** @override */
  // There will be created an object:
  // {get: {id: 'bill', show: true, wait: function}}
  // Every time at least one of the specified fields is updated, there will be a new "get" request of the provider.
  // The `get` data is used to the initial request and emit reloading of the component.
  @field((o) => o.sync.object('get', [
    // `name` will send to a provider as `id`
    ['id', 'name', (v) => v.toLowerCase()],

    // `show` will send to a provider as `show`
    'show',

    // `canRequestData` will send to a provider as `wait`
    ['wait', 'canRequestData']
  ]))

  protected readonly requestParams!: RequestParams;

  /**
   * Returns true if the component can load remote data
   */
  async canRequestData(): Promise<boolean> {
    await this.async.sleep(3..seconds());
    return true;
  };
}
```

### Preventing of the implicit requests

You can use `defaultRequestFilter` to provide a function that can filter any implicit requests: if the function returns a negative value,
the request will be aborted. If the prop is set to `true`, then all requests without payload will be aborted.

## Provider API

iData re-exports data provider methods, like, `get`, `peek`, `add`, `upd`, `del`, `post`, `url` and `base`, but wraps it with own async instance.
Also, the class adds `dropDataCache` and `dataEmitter`.

### Data handlers

iData provides a bunch of handlers for provider/request events: `onAddData`, `onUpdData`, `onDelData`, `onRefreshData` and `onRequestError`.
You are free to override these handlers in your components. By default, a component will update `db` if it is provided within a handler.

## Offline reloading

By default, a component won't reload data without the internet, but you can change this behavior by switching the `offlineReload` prop to `true`.

## Error handling

| Name            | Description                                          | Payload description                          | Payload                                  |
| --------------- |------------------------------------------------------| ---------------------------------------------|----------------------------------------- |
| `requestError`  | An error occurred during the request to the provider | Error object, function to re-try the request | `Error \| RequestError`, `RetryRequestFn` |
