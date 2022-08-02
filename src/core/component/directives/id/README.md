# core/component/directives/aria

This module provides a directive for easy adding of id attribute.

## Usage

```
< &__foo v-id = 'title'

```

The same as
```
< &__foo :id = dom.getId('title')

```

## Modifiers

1. `preserve` means that if there is already an id attribute on the element,
the directive will left it and will not set another one

```
< &__foo v-id.preserve = 'title'

```
