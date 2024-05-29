# components/friends/state

This module provides a class with methods to initialize a component state from various related sources.

```js
this.state.initFromStorage();
this.state.resetStorage();

this.state.initFromRouter();
this.state.resetRouter();
```

## How to Include this Module in Your Component?

By default, any component that inherits from [[iBlock]] has the `state` property.
However, to use the module methods, attach them explicitly to enable tree-shake code optimizations.
Place the required import declaration within your component file.

```typescript
import iBlock, { component } from 'components/super/i-block/i-block';
import State, { initFromRouter, initFromStorage } from 'components/friends/state';

// Import `initFromRouter` and `initFromStorage` methods
State.addToPrototype({initFromRouter, initFromStorage});

@component()
export default class bExample extends iBlock {}
```

## Why is This Module Needed?

Any component can bind its state to the state of another external module.
For example, a component might store some of its properties in local storage.
This means that when such a property changes, it should automatically synchronize with the storage,
and on the other hand, when the component is initialized, its value must be read from the storage.
This module does precisely that - it provides a set of APIs to synchronize external states with a component's state.

## How does synchronization work?

Synchronization operates through two-way connector methods. For example, when a component is initializing,
it calls the special `syncStorageState` method, which takes data from the storage associated with the component as
an argument. If this method returns an object, the values of this object will be mapped to
the component properties (the keys being the names of the properties). On the other hand, each of these properties
will be watched, and when any of them change, `syncStorageState` will be called again. This time, it will take an object
with the component's state and should return an object to store in the storage.

```typescript
import iBlock, { component, field } from 'components/super/i-block/i-block';
import State, { initFromStorage } from 'components/friends/state';

State.addToPrototype({initFromStorage});

@component()
export default class bExample extends iBlock {
  @field()
  opened: boolean = false;

  syncStorageState(data, type) {
    // This type indicates that data is loaded from the storage
    if (type === 'remote') {
      return {
        opened: data.isOpened
      };
    }

    // Saving data to the storage
    return {
      isOpened: this.opened
    };
  }
}
```

By default, all components have two basic methods for synchronizing with the router: `syncRouterState` and `convertStateToRouterReset`.
Additionally, all components have two similar methods for synchronizing with storage: `syncStorageState` and `convertStateToStorageReset`.

## Methods

### initFromRouter

Initializes the component's state from the router's state.
This method is required for `syncRouterState` to work.

### saveToRouter

Saves the component's state to the router's state.
The data to save is taken from the component's `syncRouterState` method. You can also pass additional parameters.

### resetRouter

Resets the component's router state.
The function takes the result of `convertStateToRouterReset` and maps it to the component.

### initFromStorage

Initializes the component's state from its local storage.
This method is required for `syncStorageState` to work.

### saveToStorage

Saves the component's state to its local storage.
The data to save is taken from the component's `syncStorageState` method.
Additionally, you can pass extra parameters.

### resetStorage

Resets the component's local storage state.
The function takes the result of `convertStateToStorageReset` and maps it to the component.

### set

Retrieves the given object values and stores them in the current component's state
(you can pass a complex property path using dots as delimiters).

If a key from an object matches a bean method by name, that method will be called with arguments taken from the value
of that key. If the value is an array, the elements of the array will be passed as arguments to the method.

The function returns an array of promises of performed operations: results of functions, etc.

```js
await Promise.all(this.state.set({
  someProperty: 1,
  'mods.someMod': true,
  someMethod: [1, 2, 3],
  anotherMethod: {}
}));
```
