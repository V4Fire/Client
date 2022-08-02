# core/component/directives/aria

This module provides a directive to add aria attributes and logic to elements through single API.

## Usage

```
< &__foo v-aria.#bla

< &__foo v-aria = {labelledby: dom.getId('bla')}

```

## Available modifiers:

- .#[string] (ex. '.#title') the same as = {labelledby: [id-'title']}


-- Roles:
- controls:
Directive can be added to any tag that includes tag with needed role. Role should be passed as a modifier.
ID or IDs are passed as value.
ID could be single or multiple written in string with space between.

There are two ways to use this engine:
1. To add role as a modifier to which passed IDs in `for` value should be added. `for` could be `string` or `string[]`.
If element controls several elements `for` should be passed as a string with IDs separated with space.
(!) Notice that this role attribute should already be added to the element. The engine does not set passed role to the current element.

Example:
```
< &__foo v-aria:controls.tab = {for: 'id1 id2 id3'}

converts to

< tab aria-controls = "id1 id2 id3" role = "tab"
```

2. To pass value `for` as an array of tuples.
First id in a tuple is an id of an element to which one the aria attributes should be added.
The second one is an id of an element to set as value in aria-controls attribute.
(!) Notice that id attribute should already be added to the element. The engine does not set passed ids to the elements.

Example:
```
< &__foo v-aria:controls = {for: [[id1, id3], [id2, id4]]}
  < span :id = "id1"
  < span :id = "id2"

converts to
< &__foo
  < span :id = "id1" aria-controls = "id3"
  < span :id = "id2" aria-controls = "id4"
```

- tabs:
Tabs always expect the 'controls' role engine to be added.


## Available standard values:
Value is expected to always be an object type. Possible keys:
- label
- labelledby
- description
- describedby
- id
