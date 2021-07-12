# super/i-block/modules/lfc

This module provides a class with some helper methods to work with a component life cycle.

## isBeforeCreate

Returns true if the component hook is equal to one of "before create" hooks: `beforeRuntime`, `beforeCreate`, `beforeDataCreate`.

```js
console.log(this.lfc.isBeforeCreate());

// Returns `false` for `beforeCreate` or `beforeDataCreate`
console.log(this.lfc.isBeforeCreate('beforeCreate', 'beforeDataCreate'));
```

## execCbAtTheRightTime

Executes the specified callback after the `beforeDataCreate` hook or `beforeReady` event
and returns a result of the invocation. If the callback can be invoked immediately, it will be invoked,
and the method returns the invocation' result. Otherwise, the method returns a promise.

This method is helpful to execute a function after the component is initialized and doesn't wait for its providers.

```js
this.lfc.execCbAtTheRightTime(() => {
  this.db.total = this.db.length;
});
```

## execCbAfterBlockReady

Executes the specified callback after the Block' instance is ready and returns a result of the invocation.
If the callback can be invoked immediately, it will be invoked, and the method returns the invocation' result.
Otherwise, the method returns a promise.

```js
this.lfc.execCbAfterBlockReady(() => {
  console.log(this.block.element('foo'));
});
```

## execCbAfterComponentCreated

Executes the specified callback after the component switched to `created` and returns a result of the invocation.
If the callback can be invoked immediately, it will be invoked, and the method returns the invocation' result.
Otherwise, the method returns a promise.

```js
this.lfc.execCbAfterComponentCreated(() => {
  console.log(this.componentName);
});
```
