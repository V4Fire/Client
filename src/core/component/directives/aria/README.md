# core/component/directives/aria

This module provides a directive to add aria attributes and logic to elements through a single API.

```
< div v-aria = {labelledby: dom.getId('title')}

/// The same as

< div :aria-labelledby = dom.getId('title')
```

The [Aria](https://www.w3.org/TR/wai-aria) specification consists of a set of entities called roles.
For example, [Tablist](https://www.w3.org/TR/wai-aria/#tablist) or [Combobox](https://www.w3.org/TR/wai-aria/#combobox).
Therefore, the directive also consists of many engines, each of which implements a particular role.

```
< div v-aria:combobox = {...}
```

## Why is this directive needed?

Accessibility is an important part of a modern web application.
However, the implementation of a particular role can be quite a challenge, due to the presence of a large number of nuances.
On the other hand, there are many unrelated components that can logically implement the same ARIA role.
Therefore, we need the ability to share this code between components and not enforce coupling between them.
In addition, ARIA roles are heavily DOM bound, so we need the ability to inject in the component markup.
It turns out that using the directive is the most optimal solution for this task.

## List of supported roles

All roles supported by the directive are located in the `roles` sub-folder.

Each role is named after the appropriate name from the ARIA specification.
Each role can accept its own set of options, which are described in its documentation.

* [Combobox](https://www.w3.org/TR/wai-aria/#combobox)
* [Dialog](https://www.w3.org/TR/wai-aria/#dialog)
* [Listbox](https://www.w3.org/TR/wai-aria/#listbox)
* [Option](https://www.w3.org/TR/wai-aria/#option)
* [Tab](https://www.w3.org/TR/wai-aria/#tab)
* [Tablist](https://www.w3.org/TR/wai-aria/#tablist)
* [Tabpanel](https://www.w3.org/TR/wai-aria/#tabpanel)
* [Tree](https://www.w3.org/TR/wai-aria/#tree)
* [Treeitem](https://www.w3.org/TR/wai-aria/#treeitem)
* [Controls](https://www.w3.org/TR/wai-aria/#aria-controls)

## Available options

All ARIA attributes could be added in options through short syntax.

```
< div v-aria = {label: 'foo', desribedby: 'id1', details: 'id2'}

/// The same as

< div :aria-label = 'foo' | :aria-desribedby = 'id1' | :aria-details = 'id2'
```

The most common are described below:

### [label]

Defines a string value that labels the current element.
See [this](https://www.w3.org/TR/wai-aria/#aria-label) for more information.

```
< input type = text | v-aria = {labelledby: 'Billing Name'}
```

### [labelledby]

Identifies the element (or elements) that labels the current element.
See [this](https://www.w3.org/TR/wai-aria/#aria-labelledby) for more information.

```
< #billing
  Billing

< #name
  Name

< input type = text | v-aria = {labelledby: 'billing name'}

< #address
  Address

< input type = text | v-aria = {labelledby: 'billing address'}
```

### [describedby]

Identifies the element (or elements) that describes the object.
See [this](https://www.w3.org/TR/wai-aria/#aria-describedby) for more information.

```
< button v-aria = {describedby: 'trash-desc'}
  Move to trash

< p#trash-desc
  Items in the trash will be permanently removed after 30 days.
```

## Modifiers

### `#`

This modifier represents a snippet for more convenient setting of the `labelledby` attribute.
Note that the identifier passed in this way is automatically associated with the component within which the directive is used.

```
< div v-aria.#title

/// The same as

< div v-aria = {labelledby: dom.getId('title')}
```
