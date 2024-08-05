# components/super/i-data

This module provides a superclass to manage the operation of a component and its data provider.
Please check out `core/data` before reading this documentation.

## Synopsis

* The component is not used on its own. It is a superclass.

* The component API does not support functional components.

* The component extends [[iBlock]].

* The component implements the [[iDataProvider]] trait.

## Basic Concepts

To set a data provider for a component, you need to specify the `dataProviderProp` prop or set its default value.
You can assign a data provider by its name from the global pool of providers
or by explicitly specifying a constructor or provider instance.
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

Each child instance of `iData` can have at most one data provider;
therefore, you must decompose the data logic between different components rather than consolidating everything into one.

This approach produces a stricter code structure that is straightforward to maintain and debug.
Also, all pending requests with the same hash are merged and the final result is distributed among the consumers.
Don't be afraid of performance degradation.

```
/// There will only be two real requests because the first two requests have the same request hash
< b-example :dataProvider = 'User' | :request = {get: {uuid: '1'}}
< b-example :dataProvider = 'User' | :request = {get: {uuid: '1'}}
< b-example :dataProvider = 'User' | :request = {get: {uuid: '2'}}
```

To optimize data loading, you can enable provider data caching.

```typescript
import { provider, Provider } from 'core/data';
import RestrictedCache from 'core/cache/restricted';

@provider
export default class User extends Provider {
  // Each GET request will be cached for 10 minutes,
  // but the cache can hold no more than 15 values
  static request = Provider.request({
    cacheTTL: (10).minutes(),
    cacheStrategy: new RestrictedCache(15)
  });

  override baseURL: string = '/user/:uuid';
}
```

### Composition of Data Providers

To get around the limitation of one provider instance per component, you can use special "extra providers" API calls.
[See more](https://v4fire.github.io/Core/modules/src_core_data_index.html#composition-of-providers).

#### Remote Providers

You can use another component as a data provider by passing the `remoteProvider` property to it.
After this, the parent component will wait for the data to load (is not supported in SSR).

```
< b-example :remoteProvider = true | @someEventWithData = onData
```

Or you can use the special [[bRemoteProvider]] component.
The component has no UI view and provides a flexible API for use as a remote provider.

```
< b-remote-provider :dataProvider = 'myData' | @change = onData
< b-remote-provider :dataProvider = 'myData' | :field = 'fieldWhenWillBeStoredData'
```

This method proves beneficial when used with a `v-if` directive; however, exercise caution if you intend
to periodically update data from remote providers—this can lead to many unnecessary re-renders.
It's important to note that `bRemoteProvider` is a standard component which requires additional time to initialize.

A practical application for this type of provider is transmitting data without expecting a response,
such as in the case of sending analytic events.

#### Manual Use of Data Providers

You are also free to use data providers manually, not just those associated with your component,
but be sure to use the createDataProviderInstance factory to create instances of data providers.
This factory takes into account nuances with SSR, memory cleanup, etc.

```typescript
import User, { UserData } from 'models/user';
import iData, { component, system } from 'components/super/i-data/i-data';

@component()
export default class bExample extends iData {
  @system((o) => o.createDataProviderInstance(User))
  user!: User;

  getUser(): Promise<UserData> {
    return this.user.get();
  }
}
```

However, it is best to avoid this approach as it can make the code confusing.

## Provider Data

The provider data will be stored in the `db` field.
By default, it has an object type, but you can specify it explicitly.

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

Before setting a new `db` value, it will be compared with the previous one.
The new data will only be applied if it is not equal to the previous one.
The default comparison method is `Object.fastClone`.
This behavior can be overridden by setting the `checkDBEquality` prop to false,
or you can provide a custom function for comparison in this prop.

### Converting Provider Data

By default, all providers create immutable data,
which helps optimize memory usage because all components with the same provider share the same instance of data.

If a component wants to modify data within the database, it must clone the original object.
You can do this by calling the `db.valueOf` method:

```
this.db = transform(this.db?.valueOf());
```

This approach works because all providers override the default `valueOf` method for data objects.

#### `dbConverter`

Each child `iData` instance has a property that can transform the data from the provider before it is stored in `db`.
You can pass a function or an iterable of functions to be applied to the provider data.

```
< b-example :dataProvider = 'myData' | :dbConverter = convertToComponent
< b-example :dataProvider = 'myData' | :dbConverter = [convertToComponent, convertMore]
```

#### `initRemoteData` and `componentConverter`

Sometimes you need to create a component that can receive data directly
from a prop or by loading it from a data provider.
You can handle this situation using `sync.link` and `initRemoteData`.
See the [[Sync]] class for more information.

The `initRemoteData` method is called every time `db` is changed.
You can override it in your component to apply the `db` data to the component field.
Finally, each descendant of `iData` has a property that can convert data from the `db` format
to a more appropriate component field format.
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

## Component Initializing

If a component has a data provider, it will request data during the initialization phase with `initLoad`.

Until the data is loaded, the component will have a loading status (`componentStatus`).
After the main provider is loaded, and if any other external providers are loaded,
the component will be placed in the `ready` status.

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

### Initialization Events

| Name            | Description                                | Payload description                     | Payload                                   |
|-----------------|--------------------------------------------|-----------------------------------------|-------------------------------------------|
| `initLoadStart` | The component starts initial loading       | Options of the loading                  | `InitLoadOptions`                         |
| `initLoad`      | The component has finished initial loading | The loaded data; Options of the loading | `CanUndef<this['DB']>`; `InitLoadOptions` |

### Preventing Initial Data Loading

By default, if a component has a data provider, it will request data on the initial load.
However, sometimes you need to manage this process manually.
You can use the `defaultRequestFilter` to provide a function that can filter any implicit requests,
such as initial loading: if the function returns a negative value, the request will be aborted.
If the attribute is set to true, then all requests without a payload will be aborted.

```
< b-example :dataProvider = 'myData' | :defaultRequestFilter = filterRequests
```

### Suspending Initial Data Loading

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

## Providing Request Parameters

You can provide the `request` prop with data to be requested by various provider methods to any child `iData` component.

```
// The `get` data is used for the initial request
< b-example :dataProvider = 'MyData' | :request = {get: {id: 1}, update: [{id: 1, name: newName}, {responseType: 'blob'}]}
```

Note that this prop is declared with the `forceUpdate: false` option.
This means it does not have a reactive effect and cannot be used in the component template.
Remember about the peculiarity of passing such props with `v-attrs`.

```
< b-example v-attrs = {'@:request': createPropAccessors(() => ({get: {id: 1}, update: [{id: 1, name: newName}, {responseType: 'blob'}]))}
```

For more details, refer to the description of the `@prop` decorator.

You can also set up a component that will generate a provider request when the specified properties change.
Just use `sync.object` and `requestParams`.
See the [[Sync]] class for additional information.

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

  // An object will be created with the following structure:
  // { id: 'bill', show: true, wait: function() {} }
  // Each time at least one of the specified fields (id, show, or wait) is updated,
  // a new request will be made to the provider's get method.
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

### Data Handlers

`iData` provides a set of provider/request event handlers:
`onAddData`, `onUpdateData`, `onDeleteData`, `onRefreshData` and `onRequestError`.
You can override these handlers in your components.
By default, a component will update `db` if it receives new data from its provider.

## Offline Reloading

By default, a component will not reload data without the Internet,
but you can change this behavior by setting the `offlineReload` parameter to `true`.

## Error Handling

| Name           | Description                                     | Payload description                                | Payload                                  |
|----------------|-------------------------------------------------|----------------------------------------------------|------------------------------------------|
| `requestError` | An error occurred while requesting the provider | The error object; A function to re-try the request | `Error │ RequestError`; `RetryRequestFn` |
