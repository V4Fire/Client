# core/component/directives/hook

This module provides a directive to provide any directive hooks into a component.
This directive is extremely useful to combine with functional components because they don't have API to
attach any hook listeners.

## Usage

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
