# core/component/directives/render

This module provides a directive to create a composition of multiple functions that return VNode-s without using JSX.

## Usage

### Replacing the VNode with another one

If you use the directive with a `template` tag without custom properties, the VNode that passed to `v-render` will replace the original one.
If the passed value is undefined or null, the directive will do nothing.

```
< template v-render = myFragment
  This content is used when the value passed to `v-render` is undefined or null.
```

### Adding child nodes

If you use the directive with a regular tag, the VNode that passed to `v-render`
will replace all children VNode-s of the original one. Also, in this case, you can provide a list of VNode-s to insert.
If the passed value is undefined or null, the directive will do nothing.

```
< div v-render = myFragment
  This content is used when the value passed to `v-render` is undefined or null.

< div v-render = [myFragment1, myFragment2]
  This content is used when the value passed to `v-render` is undefined or null.
```

### Adding component slots

If you use the directive with a component, the VNode that passed to `v-render` will replace the default or named
(if the name passed via the `slot` attribute) children slot of the original VNode. Also, in this case,
you can provide a list of VNode-s or slots to insert. If the passed value is undefined or null, the directive will do nothing.

```
< b-button v-render = mySlot
  This content is used when the value passed to `v-render` is undefined or null.

< b-button v-render = [mySlot1, mySlot2]
  This content is used when the value passed to `v-render` is undefined or null.
```
