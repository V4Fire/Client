# core/component/directives/hook

This module brings a directive to provide any directive hooks into a component.
This directive is extremely useful to combine with a flyweight component because it does not have API to
attach the hook listeners.

## Usage

```
< div v-hook = { &
  created: (el, opts, vnode, oldVnode) => console.log(el, opts, vnode, oldVnode),
  beforeMount: onBeforeMount,
  mounted: onMounted,
  beforeUpdate: onBeforeUpdate,
  updated: onUpdated,
  beforeUnmount: onBeforeUnmount,
  unmounted: onUnmounted
} .
```
