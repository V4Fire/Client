# super/i-static-page/modules/theme

This module provides a class and factory to manage the app themes.

## Synopsis

* The module uses several global variables from the config:
  * `THEME` - a name of the initial theme. If not specified, theme managing won't be available;
  * `THEME_ATTRIBUTE` - an attribute name to set a theme value to the root element;
  * `AVAILABLE_THEMES` - a list of available app themes.

* To set a new theme, use the `current` property.

* To get a set of available themes, use the `availableThemes` property.

## Events

| EventName      | Description                  | Payload description   | Payload                      |
| -------------- | ---------------------------- | --------------------- | ---------------------------- |
| `theme:change` | Theme value has been changed | The new and old value | `string`; `CanUndef<string>` |
