# components/super/i-block/modules/state

This module provides a class with methods to initialize a component state from various related sources.

```js
this.state.initFromStorage();
this.state.resetStorage();

this.state.initFromRouter();
this.state.resetRouter();
```

## How to include this module to your component?

By default, any component that inherited from [[iBlock]] has the `state` property.
But to use module methods, attach them explicitly to enable tree-shake code optimizations.
Just place the necessary import declaration within your component file.

```typescript
import iBlock, { component } from 'components/super/i-block/i-block';
import State, { initFromRouter, initFromStorage } from 'components/friends/state';

// Import `initFromRouter` and `initFromStorage` methods
VDOM.addToPrototype(initFromRouter, initFromStorage);

@component()
export default class bExample extends iBlock {}
```

## Why is this module needed?

Any component can bind its state to a state of another external module.
For example, a component may store some of its properties in a local storage.
This means that when such a property changes, it should be automatically synchronized with the storage,
and on the other hand, when the component is initialized, we must read its value from the storage.
This is exactly what this module does - it offers a set of APIs to synchronize external states with a component state.

## How does synchronization work?

Synchronization works using two-way connector methods. For example, when a component is initializing,
it calls the special `syncStorageState` method, which takes data from the storage associated with the component as
an argument. If this method returns an object, then the values of this object will be mapped to
the component properties (the keys are the names of the properties). On the other hand, each of these properties
will be watched and when any of them change, `syncStorageState` will be called again, which will now take an object
with the component state and should return an object to store in the storage.

```typescript
import iBlock, { component, field } from 'components/super/i-block/i-block';
import State, { initFromStorage } from 'components/friends/state';

VDOM.addToPrototype(initFromStorage);

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
Also, all components have two similar methods for synchronizing with a storage: `syncStorageState` and `convertStateToStorageReset`.

## Methods

### initFromRouter

Initializes the component state from the router state.
This method is required for `syncRouterState` to work.

### saveToRouter

Saves the component state to the router state.
The data to save is taken from the component `syncRouterState` method. Also, you can pass additional parameters.

### resetRouter

Resets the component router state.
The function takes the result of `convertStateToRouterReset` and maps it to the component.

### initFromStorage

Initializes the component state from its local storage.
This method is required for `syncStorageState` to work.

### saveToStorage

Saves the component state to its local storage.
The data to save is taken from the component `syncStorageState` method.
Also, you can pass additional parameters.

### resetStorage

Resets the component local storage state.
The function takes the result of `convertStateToStorageReset` and maps it to the component.

### set

Retrieves the given object values and stores them in the current component state
(you can pass a complex property path using dots as delimiters).

If a key from an object matches a bean method by name, that method will be called with arguments taken from the value
of that key. If the value is an array, then the elements of the array will be passed as arguments to the method.

The function returns an array of promises of performed operations: results of functions, etc.

```js
await Promise.all(this.state.set({
  someProperty: 1,
  'mods.someMod': true,
  someMethod: [1, 2, 3],
  anotherMethod: {}
}));
```
