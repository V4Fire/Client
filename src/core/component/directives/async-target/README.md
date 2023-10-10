# core/component/directives/async-target

This module provides a directive for marking elements where dynamically rendered fragments should be added.
You should use it in conjunction with the [[AsyncRender]] module.

```
< .container v-async-target
  /// The first ten elements are rendered synchronously.
  /// After that, the remaining elements will be divided into chunks of ten elements and rendered asynchronously.
  /// Rendering asynchronous fragments does not cause re-rendering of the main component template.
  < .&__item v-for = el in asyncRender.iterate(myData, 10)
    {{ el }}

/// It is allowed to cancel the execution of the directive
< .container v-async-target = false
```
