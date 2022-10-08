# core/component/directives/aria/roles/tabpanel

This module provides an implementation of the ARIA [tabpanel](https://www.w3.org/TR/wai-aria/#tabpanel) role.
An element with this role should be used in conjunction with elements with the roles [tablist](https://www.w3.org/TR/wai-aria/#tablist) and [tab](https://www.w3.org/TR/wai-aria/#tab).

For more information see [this](`https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/tab_role`).

```
< div v-aria:tablist
  < template v-for = (tab, i) of tabs
    < div :id = 'tab-' + i | v-aria:tab = { &
      controls: 'content-' + i,

      first: i === 0,
      selected: tab.active,
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

### [label]

A string value that labels the element it is applied to.

### [labelledby]

An element (or elements) that labels the element it is applied to.
