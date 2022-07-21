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

Example:
```
< &__foo v-aria:controls.select = {id: 'id1 id2 id3'}

same as

< select aria-controls = "id1 id2 id3"
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
