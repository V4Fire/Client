# core/component/directives/render

This module provides a directive that allows integrating one or more external VNodes into a template.
The directive supports several modes of operation:

1. The new VNode replaces the node where the directive is applied.
2. The new VNodes are inserted as child content of the node where the directive is applied.
3. The new VNodes are inserted as a component slot (if the directive is applied to a component).

## Why is This Directive Needed?

To decompose the template of one component into multiple render functions and utilize their composition.
This approach is extremely useful when we have a large template that cannot be divided into independent components.

## Usage

### Replacing one VNode with another

If you use the directive with a `template` tag without custom properties and only pass one VNode,
it will replace the original one.
If the passed value is `undefined` or `null`, the directive will do nothing.

```
< template v-render = myFragment
  This content is used when the value passed to `v-render` is undefined or null.
```

### Adding new VNodes as child content

If you use the directive with a regular tag,
the VNode passed to `v-render` will replace all child VNodes of the original.
Additionally, in this case, you can provide a list of VNodes for insertion.
If the passed value is `undefined` or `null`, the directive will do nothing.

```
< div v-render = myFragment
  This content is used when the value passed to `v-render` is undefined or null.

< div v-render = [myFragment1, myFragment2]
  This content is used when the value passed to `v-render` is undefined or null.
```

### Adding new VNodes as component slots

If you use the directive with a component, the VNode passed to `v-render` will replace the default or named slot.
To specify insertion into a named slot,
the inserted VNode must have a slot attribute with the value of the slot name to be inserted into.
It's acceptable to specify a list of VNodes for inserting into multiple slots.
If the passed value is `undefined` or `null`, the directive will do nothing.

```
< b-button v-render = mySlot
  This content is used when the value passed to `v-render` is undefined or null.

< b-button v-render = [mySlot1, mySlot2]
  This content is used when the value passed to `v-render` is undefined or null.
```
