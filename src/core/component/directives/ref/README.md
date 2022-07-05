# core/component/directives/ref

_This is a private directive. You don't need to use it explicitly._

This module provides a directive to create a ref to another component or element.
This directive is used in conjunction with the standard `ref` directive.

```
// This code will be automatically replaced by Snakeskin
< b-button ref = button

// To this code
< b-button :ref = $resolveRef('button') | v-ref = 'button'
```
