# super/i-static-page/modules/theme

This module provides a class and factory to manage the app themes.

## Synopsis

* The module uses several global variables from the config:
  * `THEME` - a name of the initial theme. If not specified, theme managing won't be available.
  * `THEME_ATTRIBUTE` - an attribute name to set a theme value to the root element
  * `AVAILABLE_THEMES` - a list of available app themes

* Theme is set using property `current`

* Available themes can be accessed by property `availableThemes`

## Events

| EventName      | Description            | Payload description | Payload                      |
| -------------- | ---------------------- | ------------------- | ---------------------------- |
| `theme:change` | Theme value has been changed    | The new and old value   | `string`; `CanUndef<string>` |
