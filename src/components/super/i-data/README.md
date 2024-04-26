# components/super/i-data

This module provides a superclass to manage the operation of a component and its data provider.
Please check out `core/data` before reading this documentation.

## Synopsis

* The component is not used on its own. It is a superclass.

* The component API does not support functional components.

* The component extends [[iBlock]].

* The component implements the [[iDataProvider]] trait.

## Basic concepts

To set a data provider for a component, you need to specify the `dataProviderProp` prop or set its default value.
You can set a date provider by its name from the global pool of providers or by explicitly specifying a constructor or provider instance.
To register a data provider within the global pool, you need to use the `@provider` decorator.

__models/user.ts__

```typescript
import { provider, Provider } from 'core/data';

@provider
export default class User extends Provider {
  override baseURL: string = '/user/:uuid';
}
```

__b-example/b-example.ts__

```typescript
import 'models/user';
import iData, { component, wait, DataProviderProp } from 'components/super/i-data/i-data';

@component()
export default class bExample extends iData {
  override dataProviderProp: DataProviderProp = 'User';
}
```

Or

```typescript
import User from 'models/user';
import iData, { component, wait, DataProviderProp } from 'components/super/i-data/i-data';

@component()
export default class bExample extends iData {
  override dataProviderProp: DataProviderProp = User;
}
```

Or

```
< b-example :dataProvider = 'User'
< b-example :dataProvider = require('models/user').default
```

After loading, the data is stored in the `db` field.

```
< template v-if = db
  {{ db.someValue }}
```

Each child instance of `iData` can have at most one data provider, i.e., you must decompose the data logic between different components,
but not combine everything in one component. This approach produces a stricter code structure that is easy to maintain and debug.
Also, all pending requests with the same hash are merged and the final result is distributed among the consumers.
Don't be afraid of performance degradation.

```
/// There will only be two real requests because the first two requests have the same request hash
< b-example :dataProvider = 'User' | :request = {get: {uuid: '1'}}
< b-example :dataProvider = 'User' | :request = {get: {uuid: '1'}}
< b-example :dataProvider = 'User' | :request = {get: {uuid: '2'}}
```

To optimize data loading, you can specify provider data caching.

```typescript
import { provider, Provider } from 'core/data';
import RestrictedCache from 'core/cache/restricted';

@provider
class User extends Provider {
  // Each get request will be cached for 10 minutes,
  // but there can be no more than 15 values in the cache
  static request = Provider.request({
    cacheTTL: (10).minutes(),
    cacheStrategy: new RestrictedCache(15)
  });

  override baseURL: string = '/user/:uuid';
}

export default User;
```

### Composition of data providers

To get around the limitation of one provider instance per component, you can use special "extra providers" API calls.
[See more](https://v4fire.github.io/Core/modules/src_core_data_index.html#composition-of-providers).

#### Remote providers

You can use another component as a data provider, pass the `remoteProvider` property to it.
After that, the parent component will wait for loading.

```
< b-example :remoteProvider = true | @someEventWithData = onData
```

Or you can use the special [[bRemoteProvider]] component.
The component has no UI view and provides a flexible API for use as a remote provider.

```
< b-remote-provider :dataProvider = 'myData' | @change = onData
< b-remote-provider :dataProvider = 'myData' | :field = 'fieldWhenWillBeStoredData'
```

This method is useful when you use it with a `v-if` directive, but be careful if you want to periodically update data from remote providers:
you can emit a bunch of redundant re-renders. Keep in mind that `bRemoteProvider` is a regular component, and it takes extra time to initialize.
A valid use case for this type of provider is to send some data without receiving a response, such as analytic events.

#### Manual use of data providers

You are free to use data providers that are not related to your component, but be aware of the asynchronous wrapper.

```typescript
import User, { UserData } from 'models/user';
import iData, { component, system } from 'components/super/i-data/i-data';

@component()
export default class bExample extends iData {
  @system((o) => o.async.wrapDataProvider(new User()))
  user!: User;

  getUser(): Promise<UserData> {
    return this.user.get();
  }
}
```

However, it is best to avoid this approach as it can make the code confusing.

## Provider data

The provider data will be stored in the `db` field. By default, it has an object type, but you can specify it explicitly.

```typescript
import 'models/user';
import iData, { component, wait, DataProviderProp } from 'components/super/i-data/i-data';

interface MyData {
  name: string;
  age: number;
}

@component()
export default class bExample extends iData {
  override readonly DB!: MyData;

  override dataProviderProp: DataProviderProp = 'User';

  getUser(): CanUndef<this['DB']> {
    return this.db;
  }
}
```

### `db` events

| Name          | Description                                          | Payload description          | Payload                |
|---------------|------------------------------------------------------|------------------------------|------------------------|
| `dbCanChange` | There is a possibility of changing the value of `db` | Provider data or `undefined` | `CanUndef<this['DB']>` |
| `dbChange`    | The value of `db` has been changed                   | Provider data or `undefined` | `CanUndef<this['DB']>` |

### Changing of `db`

Before setting a new `db` value, it will be compared with the previous one. The new data will only be applied if it is
not equal to the previous one. The default comparison is `Object.fastClone`. This behavior can be overridden by
switching the `checkDBEquality` prop to false. Or you can provide a function to compare in this prop.

### Converting provider data

By default, all providers create immutable data, which helps optimize memory usage because all components with
the same provider share the same instance of data.

If a component wants to modify data within `db`, it has to clone the original object.
You can easily do it by calling the `db.valueOf` method.

```
this.db = transform(this.db?.valueOf());
```

This works because all providers override the default `valueOf` method for data objects.

#### `dbConverter`

Each child `iData` instance has a property that can transform the data from the provider before it is stored in `db`.
You can pass a function or an iterable of functions to be applied to the provider data.

```
< b-example :dataProvider = 'myData' | :dbConverter = convertToComponent
< b-example :dataProvider = 'myData' | :dbConverter = [convertToComponent, convertMore]
```

#### `initRemoteData` and `componentConverter`

Sometimes you need to create a component that can receive data directly from a prop or by loading it from a data provider.
You can handle this situation using `sync.link` and `initRemoteData`. See the [[Sync]] class for more information.

The `initRemoteData` method is called every time `db` is changed.
You can override it in your component to apply the `db` data to the component field.
Finally, each descendant of `iData` has a property that can convert data from the `db` format to a more appropriate component field format.
You can pass a function or an iterable of functions that will be applied to `db`.

```typescript
import iData, { component, prop, field } from 'components/super/i-data/i-data';

export default class bExample extends iData {
  @prop(Object)
  dataProp: MyDataFormat;

  @field((o) => o.sync.link())
  data: MyDataFormat;

  protected override initRemoteData(): CanUndef<MyDataFormat> {
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

If a component has a data provider, it will request data during the initialization phase with `initLoad`.

Until the data is loaded, the component will have a loading status (`componentStatus`).
After the main provider is loaded, and if any other external providers are loaded, the component will be placed in the `ready` status.

You can use the `isReady` getter to avoid rendering template data fragments before it is loaded.

```
< .&__user-info v-if = isReady
  {{ db.name }}
```

Also, you can use the `@wait` decorator and similar methods.

```typescript
import 'models/user';
import iData, { component, wait, DataProviderProp } from 'components/super/i-data/i-data';

@component()
export default class bExample extends iData {
  override dataProviderProp: DataProviderProp = 'User';

  @wait('ready')
  getUser(): CanPromise<this['DB']> {
    return this.db;
  }
}
```

### Initialization events

| Name            | Description                                | Payload description                     | Payload                                   |
|-----------------|--------------------------------------------|-----------------------------------------|-------------------------------------------|
| `initLoadStart` | The component starts initial loading       | Options of the loading                  | `InitLoadOptions`                         |
| `initLoad`      | The component has finished initial loading | The loaded data; Options of the loading | `CanUndef<this['DB']>`; `InitLoadOptions` |

### Preventing initial data loading

By default, if a component has a data provider, it will request data on initial load.
But sometimes you have to manage this process manually. You can use `defaultRequestFilter` to provide a function that can filter any
implicit requests such as initial loading: if the function returns a negative value, the request will be aborted.
If the attribute is set to true, then all requests with no payload will be aborted.

```
< b-example :dataProvider = 'myData' | :defaultRequestFilter = filterRequests
```

### Suspending initial data loading

You can use `suspendedRequestsProp` and `unsuspendRequests` to lazy load components.
For example, you can only load components in the viewport.

```
< b-example &
  :dataProvider = 'myData' |
  :suspendedRequests = true |
  v-in-view = {
    threshold: 0.5,
    onEnter: (el) => el.node.component.unsuspendRequests()
  }
.
```

## Providing request parameters

You can provide the `request` prop with data to be requested by various provider methods to any child `iData` component.

```
< b-example :dataProvider = 'MyData' | :request = {get: {id: 1}, update: [{id: 1, name: newName}, {responseType: 'blob'}]}
```

The `get` data is used for the initial request.

You can also set up a component that will generate a provider request when the specified properties change.
Just use `sync.object` and `requestParams`. See the [[Sync]] class for additional information.

```typescript
import 'models/api/user';
import { Data } from 'models/api/user/interface';

import iData, { component, field, TitleValue, RequestParams, DataProviderProp } from 'components/super/i-data/i-data';

@component()
export default class bExample extends iData {
  override readonly DB!: Data;

  override readonly dataProviderProp: DataProviderProp = 'api.User';

  @field()
  name: string = 'Bill';

  @field()
  show: boolean = true;

  // There will be created an object:
  // {get: {id: 'bill', show: true, wait: function}}
  // Each time at least one of the specified fields is updated, there will be a new request to the provider `get` method.
  @field((o) => o.sync.object('get', [
    // `name` will send to the provider as `id`
    ['id', 'name', (v) => v.toLowerCase()],

    // `show` will send to the provider as `show`
    'show',

    // `canRequestData` will send to the provider as `wait`
    ['wait', 'canRequestData']
  ]))

  protected override readonly requestParams!: RequestParams;

  /**
   * Returns true if the component can load remote data
   */
  async canRequestData(): Promise<boolean> {
    await this.async.sleep(3..seconds());
    return true;
  };
}
```

## Provider API

All `iData` descendants have a `dataProvider` property through which you can work directly with the tied provider.
Please see `components/friends/data-provider` for more information.

```typescript
import User, { UserData } from 'models/user';
import iData, { component, system, DataProviderProp } from 'components/super/i-data/i-data';

@component()
export default class bExample extends iData {
  override dataProviderProp: DataProviderProp = User;

  getUser(): Promise<UserData> {
    return this.dataProvider.get();
  }

  created() {
    this.dataProvider.emitter.on('error', console.error);
  }
}
```

### Data handlers

`iData` provides a set of provider/request event handlers: `onAddData`, `onUpdateData`, `onDeleteData`, `onRefreshData` and `onRequestError`.
You can override these handlers in your components. By default, a component will update `db` if it receives new data from its provider.

## Offline reloading

By default, a component will not reload data without the Internet, but you can change this behavior by setting the `offlineReload` parameter to `true`.

## Error handling

| Name           | Description                                     | Payload description                                | Payload                                  |
|----------------|-------------------------------------------------|----------------------------------------------------|------------------------------------------|
| `requestError` | An error occurred while requesting the provider | The error object; A function to re-try the request | `Error │ RequestError`; `RetryRequestFn` |
