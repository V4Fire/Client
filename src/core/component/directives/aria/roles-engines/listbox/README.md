# core/component/directives/aria/roles-engines/listbox

This module provides an engine for `v-aria` directive.

The engine to set `listbox` role attribute.
The `listbox` role is used for lists from which a user may select one or more items which are static and may contain images.

For more information go to [listbox](`https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/listbox_role`).
For recommendations how to make accessible widget go to [listbox](`https://www.w3.org/WAI/ARIA/apg/patterns/listbox/`).

Widget `listbox` also contains elements with role `option` (see specified engine)

## Usage

```
< div v-aria:listbox = {...}
```
