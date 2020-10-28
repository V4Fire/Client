# icons/b-icon

This module provides a component to use an SVG icon from the global SVG sprite.

## Synopsis

* The component extends [[iBlock]].

* The component implements the [[iIcon]] trait.

* The component is functional.

* The component can be used as a flyweight.

* By default, the root tag of the component is `<svg>`.

* The component supports tooltips.

## Modifiers

| Name   | Description                                                                                                                                                              | Values             | Default  |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------ | -------- |
| `size` | The icon size. The "auto" value specifies the icon to be equal to CSS's defined size (`1em` by default). The "full" value specifies the icon to fill all existed places. | `'auto' \| 'full'` | `'auto'` |

Also, you can see the [[iIcon]] trait and the [[iBlock]] component.

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
