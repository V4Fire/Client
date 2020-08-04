# icons/b-icon

This module provides a component to use an SVG icon from the global SVG sprite.

## Synopsis

* The component extends [[iBlock]].

* The component implements [[iIcon]], [[iSize]] traits.

* The component is functional.

* The component can be used as flyweight.

* By default, the root tag of the component is `<svg>`.

* The component supports tooltips.

## Usage

```
< b-icon :value = 'expand'
```

The folder with svg assets is declared within `.pzlrrc` (by default, `src/assets/svg`).

```json
{
  "assets": {"sprite": "svg"}
}
```

Mind, you don't need to provide a file extension (`.svg`) within `value`.
