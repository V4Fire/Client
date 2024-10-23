# core/component/method

This module offers an API for initializing component methods on a component instance.

## Functions

### attachMethodsFromMeta

This function attaches methods to the passed component instance, taken from its associated metaobject.

### callMethodFromComponent

This function invokes a specific method from the passed component instance.

```js
// Invoke the `calc` method from the passed component
callMethodFromComponent(calculator, 'calc', 1, 2);
```
