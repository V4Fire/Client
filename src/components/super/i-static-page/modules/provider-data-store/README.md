# components/super/i-static-page/modules/provider-data-store

This module provides an API to work with data of data providers.

## How Does It Work?

When you create a component with a data provider, it loads the data from the provider during initialization.
If the data was loaded successfully, it will be stored in the root storage. The key to store data is taken from the name of the provider used.
Or, if the component has a `globalName` prop passed, it will be used as the key. After that, you can use the root storage API
to access all loaded data from providers.

```
< b-select :dataProvider = 'users.List'
< b-select :dataProvider = 'cities.List' | :globalName = 'foo'
```

```js
/// Somewhere in your app code
if (this.r.providerDataStore.has('users.List')) {
  /// See `core/object/select`
  console.log(this.r.providerDataStore.get('users.List').select({where: {id: 1}}));
}

console.log(this.r.providerDataStore.get('foo')?.data);
```

## How to Use?

By default, any component that inherited from [[iStaticPage]] has the `providerDataStore` property.
This property implements the [[Cache]] data structure and contains elements as [[ProviderDataItem]].
Each element has an additional API based on `core/object/select` to find a fragment from all the data for the given query.
Alternatively, you can touch `data` property to access the raw data object.

To access this API from an arbitrary component, use it via the root component.

```typescript
import iBlock, { component, prop, field } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  created() {
    if (this.r.providerDataStore.has('users.List')) {
      /// See `core/object/select`
      console.log(this.r.providerDataStore.get('users.List').select({where: {id: 1}}));
    }

    console.log(this.r.providerDataStore.get('foo')?.data);
  }
}
```

## Specifying an engine to cache data

By default, providers data are stored in the [[RestrictedCache]] structure, but you can specify the cache structure manually.

```typescript
import Cache from 'core/cache/simple';
import iStaticPage, { component, system, field, createProviderDataStore, ProviderDataStore } from 'components/super/i-static-page/i-static-page';

@component({root: true})
export default class bExample extends iStaticPage {
  @system(() => createProviderDataStore(new Cache()))
  providerDataStore!: ProviderDataStore;
}
```
