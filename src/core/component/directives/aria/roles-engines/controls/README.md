# core/component/directives/aria/roles-engines/controls

This module provides an engine for `v-aria` directive.

The engine is used to set `aria-controls` attribute.
The global `aria-controls` property identifies the element (or elements) whose contents or presence are controlled by the element on which this attribute is set.

For more information go to [controls](`https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-controls`).

## API

Directive can be added to any tag that includes tag with needed role. Role should be passed as a modifier.
ID or IDs are passed as value.
ID could be single or multiple written in string with space between.

There are two ways to use this engine:
1. To add role as a modifier to which passed IDs in `for` value should be added. `for` could be `string` or `string[]`.
If element controls several elements `for` should be passed as a string with IDs separated with space.
(!) Notice that this role attribute should already be added to the element. The engine does not set passed role to any element.

Example:
```
< div v-aria:controls.tab = {for: 'id1 id2 id3'}

// the same as
< div
  < button aria-controls = "id1 id2 id3" role = "tab"
```

2. To pass value `for` as an array of tuples.
First id in a tuple is an id of an element to add the aria attributes.
The second one is an id of an element to set as value in aria-controls attribute.
(!) Notice that id attribute should already be added to the element. The engine does not set passed ids to any element.

Example:
```
< div v-aria:controls = {for: [[id1, id3], [id2, id4]]}
  < span :id = "id1"
  < span :id = "id2"

// the same as
< div
  < span :id = "id1" aria-controls = "id3"
  < span :id = "id2" aria-controls = "id4"
```

## Usage

```
< div v-aria:controls = {...}
```
