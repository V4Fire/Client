# core/component/directives/aria/roles-engines/tab

This module provides an engine for `v-aria` directive.

The engine to set `tab` role attribute.
The ARIA tab role indicates an interactive element inside a `tablist` that, when activated, displays its associated `tabpanel`.

For more information go to [tab](`https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/tab_role`).
For recommendations how to make accessible widget go to [tab](`https://www.w3.org/WAI/ARIA/apg/patterns/tabpanel/`).

## API

The engine expects specific parameters to be passed.
- `isFirst`: `boolean`.
If true current tab is the first one in the list of tabs.
- `isSelected`: `boolean`.
If true current tab is active.
- `hasDefaultSelectedTabs`: `boolean`.
If true there are active tabs in the tablist widget by default.
- `orientation`: `string`.
The tablist widget view orientation.
- `@change`:`HandlerAttachment`, see `core/component/directives/aria/roles-engines/README.md`.
Internal callback `onChange` expects an `Element` or `NodeListOf<Element>` to be passed.

In addition, tabs expect the `controls` role engine to be added. An id passed to `controls` engine should be the id of the element with role `tabpanel`.

Example:
```
< button v-aria:tab | v-aria:controls = {for: 'id1'}

< v-aria:tabpanel = {labelledby: 'id2'} | :id = 'id1'
  < span :id = 'id2'
    // content
```

The engine expects the component to realize`iAccess` trait.

## Usage

```
< div v-aria:tab = { &
    isFirst: i === 0,
    isSelected: el.active,
    hasDefaultSelectedTabs: items.some((el) => !!el.active),
    orientation: orientation,
    '@change': (cb) => cb(el.active)
  }
.
```
