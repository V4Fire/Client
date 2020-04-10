# super/i-block/directives/event

This module provides a directive to attach event listeners to a DOM node. In difference of `v-bind` directive, this directive supports some extra events, like "dnd".

```
< .&__scroller v-e:dnd = { &
  onDragStart: onScrollerDragStart,
  onDrag: onScrollerDrag,
  onScrollerDragEnd: onScrollerDragEnd
} .
```
