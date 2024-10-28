# components/friends/storage

This module provides a class for persistently storing component data.
The module uses the `core/kv-storage` module with the default engine.
However, you can also manually specify the engine to be used.

```js
this.storage.set(1, 'foo');
this.storage.get('foo');
this.storage.remove('foo');
```

## How to Include this Module in Your Component?

By default, any component that inherits from [[iBlock]] has the `storage` property.

## Why Not Use `core/kv-storage`?

There are two reasons to use the `Storage` class instead of the pure `core/kv-storage` module.

1. `Storage` wraps the `core/kv-storage` module with `Async` to prevent race conditions and memory leaks.

2. `Storage` utilizes the `globalName` prop to store values,
   which helps prevent conflicts between different components that store data using the same key.

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

   /// This component overrides data from the previous one, because there is no `globalName` specified
   < b-example

   /// This component stores its data as `myComponent_${key}`,
   /// i.e., it does not conflict with the previous components
   < b-example :globalName = 'myComponent'
   ```

## How to Specify an Engine for the Storage?

Нou can pass the engine as a parameter when creating an instance of the `Storage` class.

```typescript
import * as IDBEngine from 'core/kv-storage/engines/browser-indexeddb';
import iBlock, { component, system } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  @system((ctx) => new Storage(ctx, IDBEngine.asyncLocalStorage))
  protected override readonly storage!: Storage;
}
```

## Methods

### get

Returns the value from the storage using the specified key.

### set

Saves a value to storage using the specified key.

### remove

Removes a value from storage based on the specified key.
