# core/component/method

This module provides an API to initialize component methods to a component instance.

## Functions

### attachMethodsFromMeta

Attaches methods to the specified component instance from its tied meta object.

### callMethodFromComponent

Invokes the given method from the specified component instance.

```js
// Invoke some method from the passed component
callMethodFromComponent(calculator, 'calc', 1, 2);
```
