# super/i-static-page/modules/theme

This module provides a class to theme managing.

## Synopsis

* Module uses several global variables from config:
  * `THEME` - initial theme name
  * `THEME_ATTRIBUTE` - attribute name to set an actual theme value on the root html element
  * `INCLUDED_THEMES` - a set of theme names, that available in the runtime

* Theme is set using property `current`

* Available themes can be accessed by property `list`

## Events

| EventName      | Description            | Payload description | Payload                      |
| -------------- | ---------------------- | ------------------- | ---------------------------- |
| `theme:change` | Theme value changed    | New and old value   | `string`; `CanUndef<string>` |
