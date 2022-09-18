# core/component/directives/aria/roles/combobox

This module provides an engine for `v-aria` directive.

The engine to set `combobox` role attribute.
The `combobox` role identifies an element as an input that controls another element, such as a `listbox`, that can dynamically pop up to help the user set the value of that input.

For more information about attributes go to [combobox](`https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/combobox_role`).
For recommendations how to make accessible widget go to [combobox](`https://www.w3.org/WAI/ARIA/apg/patterns/combobox/`).

## API

The role introduces several additional settings.

### [multiselectable = `false`]

Whether the widget supports a feature of multiple active options

### [@change]

A handler for changing the active option.

### [@open]

A handler for opening the option list.

### [@close]

A handler for closing the option list.

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
