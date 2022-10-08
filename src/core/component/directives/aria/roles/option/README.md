# core/component/directives/aria/roles/option

This module provides an engine for `v-aria` directive.

The engine to set `option` role attribute.
The option role is used for selectable items in a `listbox`.

For more information go to [option](`https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/option_role`).

## API

The role introduces several additional settings.

### [selected = `false`]

Whether the option is selected.

### [@change]

A handler for changing the active option.

## Usage

```
< div v-aria:option = { &
    selected: el.active
    '@change': (cb) => on('actionChange', () => cb(el.active))
  }
```
