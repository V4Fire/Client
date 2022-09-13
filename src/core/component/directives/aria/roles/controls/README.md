# core/component/directives/aria/roles/controls

This module provides an engine for `v-aria` directive.

The engine is used to set `aria-controls` attribute.
The global `aria-controls` property identifies the element (or elements) whose contents or presence are controlled by the element on which this attribute is set.

For more information go to [controls](`https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-controls`).

## API

Directive can be added to any tag that includes tag with needed role. Role should be passed as a modifier.
ID or IDs are passed as value.
ID could be single or multiple written in string with space between.

There are two ways to use this engine:
1. To add role as a modifier to which passed IDs in `for` value should be added. `for` could be `string` or `string[]`.
If element controls several elements `for` should be passed as a string with IDs separated with space.
(!) Notice that this role attribute should already be added to the element. The engine does not set passed role to any element.

Example:
```
< div v-aria:controls.tab = {for: 'id1 id2 id3'}

// the same as
< div
  < button aria-controls = "id1 id2 id3" role = "tab"
```

2. To pass value `for` as an array of tuples.
First id in a tuple is an id of an element to add the aria attributes.
The second one is an id of an element to set as value in aria-controls attribute.
(!) Notice that id attribute should already be added to the element. The engine does not set passed ids to any element.

Example:
```
< div v-aria:controls = {for: [[id1, id3], [id2, id4]]}
  < span :id = "id1"
  < span :id = "id2"

// the same as
< div
  < span :id = "id1" aria-controls = "id3"
  < span :id = "id2" aria-controls = "id4"
```

## Usage

Example with `b-list`:

```
< b-list :items = [ &
  {label: 'First tab', id: 'tab-1', controls: 'panel-1'},
  {label: 'Second tag', id: 'tab-2', controls: 'panel-2'},
  {label: 'Third tab', id: 'tab-3', controls: 'panel-3'}
] .

< div id = 'panel-1' | v-aria:tabpanel = {labelledby: 'tab-1'}
  < p
    Content for the first panel

< div id = 'panel-2' | v-aria:tabpanel = {labelledby: 'tab-2'}
  < p
    Content for the second panel

< div id = 'panel-3' | v-aria:tabpanel = {labelledby: 'tab-3'}
  < p
    Content for the third panel
```

Example with custom tab list:

```
< div.custom-page
  < div v-aria.tablist = {label: 'Sample Tabs'}
    < span &
      id = 'tab-1' |
      v-aria.tab = {...config} |
      v-aria.controls = {for: 'panel-1'}
        First Tab

    < span &
      id = 'tab-2' |
      v-aria.tab = {...config} |
      v-aria.controls = {for: 'panel-2'}
        Second Tab

    < span &
      id = 'tab-3' |
      v-aria.tab = {...config} |
      v-aria.controls = {for: 'panel-3'}
        Third Tab

  < div id = 'panel-1' | v-aria.tabpanel = {labelledby = 'tab-1'}
    < p
      Content for the first panel

  < div id = 'panel-2' | v-aria.tabpanel = {labelledby = 'tab-2'}
    < p
      Content for the second panel

  < div id = 'panel-3' | v-aria.tabpanel = {labelledby = 'tab-3'}
    < p
     Content for the third panel

```
