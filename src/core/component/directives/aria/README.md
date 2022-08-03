# core/component/directives/aria

This module provides a directive to add aria attributes and logic to elements through single API.

## Usage

```
< &__foo v-aria.#bla

< &__foo v-aria = {labelledby: dom.getId('bla')}
```

## Available modifiers:

- .#[string] (ex. '.#title')

Example
```
< v-aria.#title

the same as
< v-aria = {labelledby: dom.getId('title')}
```

-- Roles:
- `controls`:
The engine to set aria-controls attribute.
For more information go to [`https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-controls`].

Directive can be added to any tag that includes tag with needed role. Role should be passed as a modifier.
ID or IDs are passed as value.
ID could be single or multiple written in string with space between.

There are two ways to use this engine:
1. To add role as a modifier to which passed IDs in `for` value should be added. `for` could be `string` or `string[]`.
If element controls several elements `for` should be passed as a string with IDs separated with space.
(!) Notice that this role attribute should already be added to the element. The engine does not set passed role to any element.

Example:
```
< &__foo v-aria:controls.tab = {for: 'id1 id2 id3'}

the same as
< &__foo
  < button aria-controls = "id1 id2 id3" role = "tab"
```

2. To pass value `for` as an array of tuples.
First id in a tuple is an id of an element to add the aria attributes.
The second one is an id of an element to set as value in aria-controls attribute.
(!) Notice that id attribute should already be added to the element. The engine does not set passed ids to any element.

Example:
```
< &__foo v-aria:controls = {for: [[id1, id3], [id2, id4]]}
  < span :id = "id1"
  < span :id = "id2"

the same as
< &__foo
  < span :id = "id1" aria-controls = "id3"
  < span :id = "id2" aria-controls = "id4"
```

- `dialog`:
The engine to set `dialog` role attribute.
For more information go to [`https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/dialog_role`].

Always expects `iOpen` trait to be realized.

- `tab`:
The engine to set `tab` role attribute.
For more information go to [`https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/tab_role`].

Tabs always expect the `controls` role engine to be added. It should 'point' to the element with role `tabpanel`.

Example:
```
< button v-aria:tab | v-aria:controls = {for: 'id1'}

< v-aria:tabpanel = {labelledby: 'id2'} | :id = 'id1'
  < span :id = 'id2'
    // content
```

- `tablist`:
The engine to set `tablist` role attribute.
For more information go to [`https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/tablist_role`].

- `tabpanel`:
The engine to set `tablist` role attribute.
For more information go to [`https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/tabpanel_role`].

Always expects `label` or `labelledby` params to be passed.

Example:
```
< v-aria:tabpanel = {labelledby: 'id1'}
  < span :id = 'id1'
    // content
```

- `tree`:
The engine to set `tree` role attribute.
For more information go to [`https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/tree_role`].

- `treeitem`:
The engine to set `treeitem` role attribute.
For more information go to [`https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/treeitem_role`].

- `combobox`:
The engine to set `combobox` role attribute.
For more information go to [`https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/combobox_role`].

- `listbox`:
The engine to set `listbox` role attribute.
For more information go to [`https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/listbox_role`].

- `option`:
The engine to set `option` role attribute.
For more information go to [`https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/option_role`].

## Available values:
Parameters passed to the directive are expected to always be object type. Any directive handle common keys:
- label
Expects string as 'title' to the specified element

- labelledby
Expects string as an id of the element. This element is a 'title' of to the specified element

- description
Expects string as expanded 'description' to the specified element

- describedby
Expects string as an id of the element. This element is an expanded 'description' to the specified element

Also, there are specific role keys. For info go to [`core/component/directives/role-engines/interface.ts`](core/component/directives/role-engines/interface.ts).
