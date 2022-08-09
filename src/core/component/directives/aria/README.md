# core/component/directives/aria

This module provides a directive to add aria attributes and logic to elements through single API.

## Usage

```
< &__foo v-aria.#bla

< &__foo v-aria = {label: 'title'}
```

## Available modifiers:

- .#[string] (ex. '.#title')

Example
```
< v-aria.#title

the same as
< v-aria = {labelledby: dom.getId('title')}
```

## Available values:
Parameters passed to the directive are expected to always be object type. Any directive handle common keys:
- label
Expects string as 'title' to the specified element

- labelledby
Expects string as an id of the element. This element is a 'title' of to the specified element

- description
Expects string as expanded 'description' to the specified element

- describedby
Expects string as an id of the element. This element is an expanded 'description' to the specified element

Also, there are specific role keys. For info go to [`core/component/directives/role-engines/`](core/component/directives/role-engines/).
