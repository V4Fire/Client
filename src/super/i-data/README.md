# super/i-data

Before reading this documentation, please see [[Provider]].

This module provides a superclass to manage the working of a component and data provider.

## Basic concepts

To select a data provider tied with a component, you need to provide the `dataProvider` prop or set the default value for it. Mind, the prop value has a string type and contains a provider name from the global pool. To register a data provider within the global pool, you need to use the `@provider` decorator.

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

After loading of data there are stored within the `db` field.

```
< template v-if = db
  {{ db.someValue }}
```

Every child instance of iData can have no more than one data provider, i.e., you should decompose your data logic between different components, but not to combine all in one component. This approach produces a more strict code structure that is easy to support and debug. Also, all pending requests with the same hash are joined, and the final result will bee shared between consumers. Don't be afraid about the performance decreasing.

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

## Component initializing

If a component has a data provider, it will ask for data on the initializing stage using `initLoad`.
Till data is loaded, the component will have the `loading` status. After the main provider loading and if any other external providers are loaded, the component will be switched to `ready` status.

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

### Preventing of initial data loading
