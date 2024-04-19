# core/component/directives/ref

_This is a private directive. You don't need to use it explicitly._

This module provides a directive for creating a reference to another component or element.
This directive is used in conjunction with the standard `ref` directive.

```
/// This code will be automatically replaced by Snakeskin
< b-button ref = button

/// To this code
< b-button :ref = $resolveRef('button') | v-ref = 'button'
```

## Why is This Directive Needed?

V4Fire supports two types of components: regular and functional.
From the perspective of the rendering library used, functional components are regular functions that return VNodes.
However, V4Fire allows for the utilization of methods and properties with such components,
much like you would do with regular ones.
In essence, the difference between such components is that functional components do not create reactive links
between their data and their representation.
Put simply: when the state changes, the component template will not automatically update.
These components are easier to initialize and render,
and their usage can help optimize the periodic rendering of the application.
Problems arise when we create a reference to such a component using the standard `ref` directive:
this link will be stored as references to a DOM node, not the component context.
This directive corrects this behavior.
