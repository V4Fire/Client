# core/component/hook

This module provides an API to manage component hooks.

## Functions

### runHook

Runs a hook on the specified component instance.
The function returns a promise that is resolved when all hook handlers are executed.

```js
runHook('beforeCreate', component).then(() => console.log('Done!'));
```
