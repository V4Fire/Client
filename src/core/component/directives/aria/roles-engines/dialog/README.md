# core/component/directives/aria/roles-engines/dialog

This module provides an engine for `v-aria` directive.

The engine to set `dialog` role attribute.
The `dialog` role is used to mark up an HTML based application dialog or window that separates content or UI from the rest of the web application or page.

For more information go to [dialog](`https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/dialog_role`).

## API

The engine expects the component to realize the`iOpen` trait.

## Usage

```
< div v-aria:dialog
```
