# core/component/directives/aria/roles/tab

This module provides an implementation of the ARIA [tab](https://www.w3.org/TR/wai-aria/#tab) role.
An element with this role should be used in conjunction with elements with the roles [tablist](https://www.w3.org/TR/wai-aria/#tablist) and [tabpanel](https://www.w3 .org/TR /wai-aria/#tabpanel)
The role expects the component within which the directive is used to implement the [[iAccess]] characteristic.

For more information see [this](`https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/tab_role`).

```
< div v-aria:tablist
  < template v-for = (tab, i) of tabs
    < div :id = 'tab-' + i | v-aria:tab = { &
      controls: 'content-' + i,

      isFirst: i === 0,
      isSelected: tab.active,
      hasDefaultSelectedTabs: tab.some((tab) => Boolean(tab.active)),

      '@change': (cb) => cb(tab.active)
    } .

< template v-for = (content, i) of tabsContent
  < div :id = 'content-' + i | v-aria:tabpanel = {labelledby: 'tab-' + i}
    {{ content }}
```

## Available options

Any ARIA attributes could be added in options through the short syntax.

```
< div v-aria = {label: 'foo', desribedby: 'id1', details: 'id2'}

/// The same as

< div :aria-label = 'foo' | :aria-desribedby = 'id1' | :aria-details = 'id2'
```

Also, the role introduces several additional settings.

### [isFirst = `false`]

Whether the tab is the first in the tablist.

### [isSelected = `false`]

Whether the tab is selected.

### [hasDefaultSelectedTabs = `false`]

Whether there is at least one selected tab by default.

### [@change]

A handler for changing the active tab.
