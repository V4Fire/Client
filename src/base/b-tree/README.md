# base/b-tree

This module provides API to render a recursive list of elements.

## Synopsis

* The component extends [[iData]].

* The component implements the [[iItems]] trait.

* By default, the root tag of the component is `<div>`.

## Features

* Recursive rendering of any components.

* Folding of branches.

## Modifiers

| Name         | Description             | Values    | Default |
| ------------ | ----------------------- | ----------| ------- |
| `folded`     | Fold or not child items | `Boolean` | `true`  |

Also, you can see the [[iData]] component.

## Events

| EventName | Description                                            | Payload description                                            | Payload                          |
| --------- | ------------------------------------------------------ | -------------------------------------------------------------- | -------------------------------- |
| `fold`    | One of the component items has been folded or unfolded | A link to the DOM element; The item object; The folding status | `HTMLElement`; `Item`; `boolean` |

Also, you can see the [[iData]] component.

## Associated types

The component has two associated types to specify a type of component items: **Item** and **Items**.

```typescript
import bTree, { component } from 'super/b-tree/b-tree';

export * from 'super/b-list/b-list';

@component()
export default class myTree extends bTree {
  /** @override */
  readonly Item!: MyItem;
}
```

## Usage

1. Simple use of the component with a provided list of items and component to render.

```
< b-tree &
  /// The specified items are rendered as `b-checkbox`-es
  :item = 'b-checkbox' |

  :items = [
    {id: 'foo'},
    {id: 'bar', children: [
      {id: 'fooone'},
      {id: 'footwo'},

      {
        id: 'foothree',
        children: [
          {id: 'foothreeone'}
        ]
      },

      {id: 'foosix'}
    ]}
  ]
.
```

2. Providing extra attributes to a component to render.

```
< b-tree &
  :item = 'b-checkbox' |
  :itemProps = (el, i, params) => el.id === 'foo' ? {label: 'foo'} : {} |
  :items = listOfItems
.
```

3. Providing a key to the internal `v-for` directive.

```
< b-tree &
  :item = 'b-checkbox' |
  :itemKey = 'customId' |
  :items = listOfItems
.
```

4. Providing a component to render via a function.

```
< b-tree &
  :item = (el, i) => el.id === 'foo' ? 'b-checkbox' : 'b-radio-button' |
  :items = listOfItems
.
```

5. Providing a component to render via a slot.

```
< b-tree :items = listOfItems
  < template #default = {item}
    < b-checkbox v-if = item.id === 'foo'
    < b-radio-button v-else
```

6. Loading items from a data provider.

```
< b-tree :item = 'b-checkbox' | :dataProvider = 'MyProvider'
```

## Branch Folding

The module supports a feature to fold child branches of each item. It is implemented by using CSS modifiers, and by default,
elements have no styles. So you have to write some CSS rules to hide children when the item node has the `folded` modifier.

For instance:

```
&__fold:before
  content "-"
  display block
  text-align center

&__node_folded_true &__fold:before
  content "+"

&__node_folded_true &__children
  display none
```

All elements have the `folded` modifier in `true` by default.
To change this, just provide the modifier values as a prop.

```
< b-tree &
  :item = 'b-checkbox' |
  :items = items |
  :folded = false
.
```

Or

```
< b-tree &
  :item = 'b-checkbox' |
  :items = [
    {id: 'foo'},

    {
      id: 'bar',

      // This branch isn't folded
      folded: false,

      children: [
        {id: 'fooone'},
        {id: 'footwo'}
      ]
    }
  ]
.
```

## Slots

The component supports a bunch of slots to provide:

1. `default` to render each item (instead of providing the `item` prop).

```
< b-tree :items = listOfItems
  < template #default = {item}
    {{ item.label }}
```

2. `fold` to provide a template to render `fold` blocks.

```
< b-tree :item = 'b-checkbox' | :items = listOfItems
  < template #fold = o
    < .&__fold :v-attrs = o.params
      ➕
```

## External render parameters

Module renders elements via `asyncRender` of the root tree node with the default rendering function.
See [[AsyncRender]] for additional information.

### renderFilter

Common filter to render items via `asyncRender`.

```
< b-tree :item = 'b-checkbox' | :items = listOfItems | :renderFilter = () => async.idle()
```

### nestedRenderFilter

Filter to render nested items via `asyncRender`.

```
< b-tree :item = 'b-checkbox' | :items = listOfItems | :nestedRenderFilter = () => async.idle()
```

### renderChunks

A number of chunks to render per tick via `asyncRender`.

```
< b-tree :item = 'b-checkbox' | :items = listOfItems | :renderChunks = 3
```
