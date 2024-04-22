# core/component/directives/hook

This module provides a directive that allows you to listen for any lifecycle handlers of the directive
from the component.

```
< div v-hook = { &
  beforeCreate: (opts, vnode) => console.log(opts, vnode),
  created: (el, opts, vnode, oldVnode) => console.log(el, opts, vnode, oldVnode),
  beforeMount: onBeforeMount,
  mounted: onMounted,
  beforeUpdate: onBeforeUpdate,
  updated: onUpdated,
  beforeUnmount: onBeforeUnmount,
  unmounted: onUnmounted
} .
```

## Why is This Directive Needed?

This directive is typically used with functional components as they do not initially possess their own lifecycle API and
can easily be supplemented with it using this directive.
However, feel free to utilize this directive in any other scenarios if you find it beneficial.

