# friends/storage

This module provides a class for persistent storage of component data.
The module uses `core/kv-storage` with the default engine. But you can specify the engine to use manually.

```js
this.storage.set(1, 'foo');
this.storage.get('foo');
this.storage.remove('foo');
```

## Why not to use `core/kv-storage`?

There are two reasons to use `Storage` instead of the pure `core/kv-storage` module.

1. `Storage` wraps the `core/kv-storage` module with `Async` to prevent race conditions.

2. `Storage` uses the `globalName` prop to store values to prevent conflicts between different components that store
   data with the same key.

   ```typescript
   import iBlock, { component } from 'super/i-block/i-block';

   @component()
   export default class bExample extends iBlock {
     mounted() {
       this.storage.set('foo', Math.random());
     }
   }
   ```

   ```
   < b-example

   /// This component overrides data from the previous, because there is no specified `globalName`
   < b-example

   /// This component stores its data as `myComponent_${key}`,
   /// i.e., it does not conflict with the previous components.
   < b-example :globalName = 'myComponent'
   ```

## How to specify an engine to store?

Override the `storage` system field by specifying the used engine.

```typescript
import * as IDBEngine from 'core/kv-storage/engines/browser-indexeddb';
import iBlock, { component, system } from 'super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  /** @override */
  @system((ctx) => new Storage(ctx, IDBEngine.asyncLocalStorage))
  protected readonly storage!: Storage;
}
```

## Methods

### get

Returns a value from the storage by the specified key.

### set

Saves a value to the storage by the specified key.

### remove

Removes a value from the storage by the specified key.
