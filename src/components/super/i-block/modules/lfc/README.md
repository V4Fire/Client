# components/super/i-block/modules/lfc

This module provides a class with helper methods to work with a component life cycle.

## Why is This Module Necessary?

One of the main causes of performance problems in applications with automatic view updates is uncontrolled work with component states.
In simple terms, if we change the component state too often, then this forces it to do more re-renders, which in turn reduces performance.
This module solves this problem. It provides a set of methods to "collapse" such adjacent state updates and performing them in a single update,
which reduces the need for re-rendering.

## Methods

### isBeforeCreate

Returns true if the active component hook is equal to one of "before-create" hooks: `beforeRuntime`, `beforeCreate`, `beforeDataCreate`.

```js
console.log(this.lfc.isBeforeCreate());

// Returns `false` for `beforeCreate` or `beforeDataCreate`
console.log(this.lfc.isBeforeCreate('beforeCreate', 'beforeDataCreate'));
```

### execCbAtTheRightTime

Executes the specified callback after the `beforeDataCreate` hook or `beforeReady` event.
If the callback can be called immediately, it will be called and the method will return the call result.
Otherwise, the method returns a promise.

This method is helpful to execute a function after a component is initialized and does not wait for its providers.

```js
this.lfc.execCbAtTheRightTime(() => {
  this.db.total = this.db.length;
});
```

### execCbAfterBlockReady

Executes the specified callback after the Block instance is ready.
If the callback can be called immediately, it will be called and the method will return the call result.
Otherwise, the method returns a promise.

```js
this.lfc.execCbAfterBlockReady(() => {
  console.log(this.block.element('foo'));
});
```

### execCbAfterComponentCreated

Executes the specified callback after the component switched to `created`.
If the callback can be called immediately, it will be called and the method will return the call result.
Otherwise, the method returns a promise.

```js
this.lfc.execCbAfterComponentCreated(() => {
  console.log(this.componentName);
});
```
