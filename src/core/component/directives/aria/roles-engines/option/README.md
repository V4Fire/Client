# core/component/directives/aria/roles-engines/option

This module provides an engine for `v-aria` directive.

The engine to set `option` role attribute.
The option role is used for selectable items in a `listbox`.

For more information go to [option](`https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/option_role`).

## API

The engine expects specific parameters to be passed.
- `isSelected`: `boolean`.
If true current option is selected by default.
- `@change`:`HandlerAttachment`, see `core/component/directives/aria/roles-engines/README.md`.
Internal callback `onChange` expects an `boolean` value if current option is selected.

## Usage

```
< div v-aria:option = { &
    isSelected: el.active
    '@change': (cb) => on('actionChange', () => cb(el.active))
  }
```
