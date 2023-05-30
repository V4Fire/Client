# components/traits/i-width

This module provides a trait for a component that needs to implement the "width" behavior.

## Synopsis

* This module provides an abstract class, not a component.

* The trait contains TS logic and default styles.

## Modifiers

| Name    | Description         | Values                          | Default |
|---------|---------------------|---------------------------------|---------|
| `width` | The component width | `'full'  │ 'auto'  │ 'inherit'` | -       |

## Styles

The trait provides a bunch of optional styles for the component.

```stylus
$p = {
  helpers: true
  selector: ("")
}

i-width
  if $p.helpers
    $fullS = ()
    $autoS = ()
    $inheritS = ()

    for $s in $p.selector
      push($fullS, "&_width_full " + $s)
      push($autoS, "&_width_auto " + $s)
      push($inheritS, "&_width_inherit " + $s)

    {join(",", $fullS)}
      width 100%

    {join(",", $autoS)}
      width auto

    {join(",", $inheritS)}
      width inherit
```

To enable these styles, import the trait into your component and call the provided mixin in your component.

```stylus
@import "components/traits/i-width/i-width.styl"

$p = {
  widthHelpers: true
}

b-button
  i-width({helpers: $p.widthHelpers})
```
