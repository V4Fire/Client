# core/component/prop

This module provides API to initialize component props to a component instance.

## Methods

### initProps

Initializes input properties (aka "props") of the passed component instance.
While a component prop is being initialized, its name will be stored in the `$activeField` property.
The function returns a dictionary with the initialized props.

### isTypeCanBeFunc

Returns true if the specified prop type can be a function.

```js
console.log(isTypeCanBeFunc(Boolean));             // false
console.log(isTypeCanBeFunc(Function));            // true
console.log(isTypeCanBeFunc([Function, Boolean])); // true
```
