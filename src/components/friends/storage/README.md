# components/friends/storage

This module provides a class for the persistent storage of component data. The module utilizes the `core/kv-storage` module with the default engine. However, you can also manually specify the engine to be used.

```js
this.storage.set(1, 'foo');
this.storage.get('foo');
this.storage.remove('foo');
```

## How to include this module in your component?

By default, any component that inherits from [[iBlock]] has the `storage` property.

## Why not use `core/kv-storage`?

There are two reasons to use the `Storage` class instead of the pure `core/kv-storage` module.

1. `Storage` wraps the `core/kv-storage` module with `Async` to prevent race conditions and memory leaks.

2. `Storage` utilizes the `globalName` prop to store values, which helps prevent conflicts between different components that store data using the same key.

   ```typescript
   import iBlock, { component } from 'components/super/i-block/i-block';

   @component()
   export default class bExample extends iBlock {
     mounted() {
       this.storage.set('foo', Math.random());
     }
   }
   ```

   ```
   < b-example

   /// This component overrides data from the previous, because there is no `globalName` specified
   < b-example

   /// This component stores its data as `myComponent_${key}`,
   /// i.e., it does not conflict with the previous components.
   < b-example :globalName = 'myComponent'
   ```

## How to specify an engine for storage?

Override the `storage` system field by specifying the desired engine to be used.

```typescript
import * as IDBEngine from 'core/kv-storage/engines/browser-indexeddb';
import iBlock, { component, system } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  /** @override */
  @system((ctx) => new Storage(ctx, IDBEngine.asyncLocalStorage))
  protected readonly storage!: Storage;
}
```

## Methods

### get

Returns a value from storage based on the specified key.

### set

Saves a value to storage using the specified key.

### remove

Removes a value from storage based on the specified key.
