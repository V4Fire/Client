# super/i-block

This module provides a super class for any V4Fire components.
This class contains the most necessary APIs, such as: event API, modifiers API, state and life cycle API, property watching API, etc.
The functionality is divided into several parts: the behavior that the class itself declares and the many friendly classes that work through composition.
Also, this module re-exports part of the functionality and types from the `core/component` module.

```typescript
import iBlock, { component, prop, field } from 'super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  @prop(Number)
  a: number;

  @prop(Number)
  b: number;

  @field(ctx => ctx.a + ctx.b)
  result: number;
}
```

## Friendly classes

The `iBlock` class has many properties that delegate functionality to other modules.
Some of these properties can be used anywhere, and some only within the class or its descendants.
For more information on any of these properties, refer to their module documentation.

### Public

* `provide` (`friends/provide`) - a class with methods to provide component classes/styles to another component, etc.
* `field` (`friends/field`) - a class with helper methods for safely accessing component/object properties.
* `analytics` (`friends/analytics`) - a class to send component analytic events.
* `sync` (`friends/sync`) - an API to synchronize fields and props of the component.
* `asyncRender` (`friends/async-render`) - a class to render component fragments asynchronously.
* `vdom` (`friends/vdom`) - a class for low-level working with a component VDOM tree.
* `lfc` (`super/i-block/modules/lfc`) - a class with helper methods to work with the component life cycle.

### Protected

* `daemons` (`friends/daemons`) - a class to create daemons associated with a component.
* `block` (`friends/block`) - an API to work with a component in terms of [BEM](https://en.bem.info/methodology/quick-start/).
* `dom` (`friends/dom`) - a class for low-level working with a component DOM tree.

* `async` (`core/async`) - an API to tie and control async operations.
* `$async` (`core/async`) - an API to tie and control async operations (this API is used for protected/private consumers,
   such as private directives or component engines).

* `storage` (`friends/storage`) - a class for persistent storage of component data.
* `state` (`friends/state`) - a class with methods to initialize a component state from various related sources.

* `moduleLoader` (`friends/module-loader`) - a class to manage dynamically loaded modules.
* `opt` (`super/i-block/modules/opt`) - a class with helper methods to optimize component rendering.
* `browser` (`core/helpers`) - an API to determine the current browser name/version.

* `h` (`core/helpers`) - a dictionary with some helper functions.
* `l` - a link to the `globalThis.l` function.

* `location` - a link to the native `location` API.
* `global` - a link to the global object.
* `console` - a link to the native `console` API.
