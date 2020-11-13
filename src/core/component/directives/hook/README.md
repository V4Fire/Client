# core/component/directives/hook

This module brings a directive to provide any directive hooks into a component.
This directive is extremely useful to combine with a flyweight component because it doesn't have API to
attach the hook listeners.

## Usage

```
< .&__class v-hook = { &
  bind: (el, opts, vnode, oldVnode) => console.log(el, opts, vnode, oldVnode),
  inserted: onInserted,
  update: onUpdate,
  componentUpdated: onComponentUpdated,
  unbind: onUnbind
} .
```
