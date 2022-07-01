# core/component/directives/hook

This module provides a directive with which you can listen to any directive lifecycle hooks from a component.
This directive is used by default with functional components, as they don't have their own life cycle API.

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
