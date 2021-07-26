# super/i-static-page/modules/provider-data-store

This module provides API to work with data of data providers globally.

## How does it work?

When you create a component with a data provider, it will load data from the provider during the component's initialization.
If the data has been successfully loaded, it will be stored in the root storage.
A key to store data is taken from the used provider' name. Or, if the component has the passed `globalName` prop,
it will be used as the key. After this, you are free to use the root storage API to access all loaded data from providers.

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

## providerDataStore

`providerDataStore` is a property from the root component that implements a [[Cache]] data structure.
The structure contains elements as [[ProviderDataItem]]. Each element has extra API based on `core/object/select`
to find a chunk from the whole data by the specified query. Also, you can touch the `data` to access the raw data object.

### Specifying an engine to cache data

By default, providers' data are stored within a [[RestrictedCache]] structure, but you can specify the cache structure manually.

```typescript
import Cache from 'core/cache/simple';
import iStaticPage, { component, system, field, createProviderDataStore, ProviderDataStore } from 'super/i-static-page/i-static-page';

export * from 'super/i-static-page/i-static-page';

@component({root: true})
export default class pV4ComponentsDemo extends iStaticPage {
  @system(() => createProviderDataStore(new Cache()))
  providerDataStore!: ProviderDataStore;
}
```
