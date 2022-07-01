# core/component/directives/async-target

This module provides a directive to mark the element where should be appended dynamically render fragments.
You should use it with the [[AsyncRender]] module.

## Usage

```
< .container v-async-target
  /// The first ten elements are rendered synchronously.
  /// After that, the rest elements will be split into chunks by ten elements and rendered asynchronously.
  /// The rendering of async fragments does not force re-rendering of the main component template.
  < .&__item v-for = el in asyncRender.iterate(myData, 10)
    {{ el }}
```
