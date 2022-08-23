# core/component/directives/aria/roles-engines/combobox

This module provides an engine for `v-aria` directive.

The engine to set `combobox` role attribute.
The `combobox` role identifies an element as an input that controls another element, such as a `listbox`, that can dynamically pop up to help the user set the value of that input.

For more information about attributes go to [combobox](`https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/combobox_role`).
For recommendations how to make accessible widget go to [combobox](`https://www.w3.org/WAI/ARIA/apg/patterns/combobox/`).

## API

The engine expects specific parameters to be passed.
- `isMultiple`:`boolean`.
If true widget supports multiple selected options.
- `@change`:`HandlerAttachment`, see `core/component/directives/aria/roles-engines/README.md`.
Internal callback `onChange` expects an `Element` to be passed.
- `@open`:`HandlerAttachment`.
Internal callback `onChange` expects an `Element` to be passed.
- `@close`:`HandlerAttachment`.

## Usage

```
< div v-aria:combobox = { &
    isMultiple: multiple,
    '@change': (cb) => on('actionChange', cb),
    '@open': 'open',
    '@close': 'close'
  }
.
```
