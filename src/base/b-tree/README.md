# base/b-tree

This module provides a component to render a recursive list of elements.

## Synopsis

* The component extends [[iData]].

* The component implements the [[iActiveItems]] trait.

* By default, the root tag of the component is `<div>`.

## Features

* Recursive rendering of any components.

* Folding of branches.

## Modifiers

See the [[iItems]] trait and the [[iData]] component.

## Events

| EventName     | Description                                  | Payload description                        | Payload               |
|---------------|----------------------------------------------|--------------------------------------------|-----------------------|
| `fold`        | One of the component items has been folded   | A link to the DOM element; The item object | `Item`; `HTMLElement` |
| `unfold`      | One of the component items has been unfolded | A link to the DOM element; The item object | `Item`; `HTMLElement` |
| `itemsChange` | The component items has been changed         | An array of items                          | `Items`               |

See the [[iActiveItems]] trait and the [[iData]] component.

## Associated types

The component has associated type to specify active component item: **Active**.

```typescript
import bTree, { component } from 'super/b-tree/b-tree';

export * from 'super/b-tree/b-tree';

@component()
export default class myTree extends bTree {
  /** @override */
  readonly Active!: number;
}
```

There are associated types to specify a type of component items: **Item** and **Items**.

```typescript
import bTree, { component } from 'super/b-tree/b-tree';

export * from 'super/b-list/b-list';

@component()
export default class myTree extends bTree {
  /** @override */
  readonly Item!: MyItem;
}
```

Also, you can see the parent component.

## Usage

### Simple use of the component with a provided list of items and components to render

```
< b-tree &
  /// The specified items are rendered as `b-checkbox`-es
  :item = 'b-checkbox' |

  :items = [
    {value: 'foo'},
    {value: 'bar', children: [
      {value: 'fooone'},
      {value: 'footwo'},

      {
        value: 'foothree',
        children: [
          {value: 'foothreeone'}
        ]
      },

      {value: 'foosix'}
    ]}
  ]
.
```

### Providing extra attributes to a component to render

```
< b-tree &
  :item = 'b-checkbox' |
  :itemProps = (el, i, params) => el.id === 'foo' ? {label: 'foo'} : {} |
  :items = listOfItems
.
```

### Providing a key to the internal `v-for` directive

```
< b-tree &
  :item = 'b-checkbox' |
  :itemKey = 'customId' |
  :items = listOfItems
.
```

### Providing a component to render via a function

```
< b-tree &
  :item = (el, i) => el.id === 'foo' ? 'b-checkbox' : 'b-radio-button' |
  :items = listOfItems
.
```

### Providing a component to render via a slot

```
< b-tree :items = listOfItems
  < template #default = {item}
    < b-checkbox v-if = item.id === 'foo'
    < b-radio-button v-else
```

### Loading items from a data provider

```
< b-tree :item = 'b-checkbox' | :dataProvider = 'MyProvider'
```

## Branch Folding

The module supports a feature to fold child branches of each item. It is implemented by using CSS modifiers, and by default,
elements have no styles. So you have to write some CSS rules to hide children when the item node has the `folded` modifier.

For instance:

```stylus
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
    {value: 'foo'},

    {
      value: 'bar',

      // This branch isn't folded
      folded: false,

      children: [
        {value: 'fooone'},
        {value: 'footwo'}
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

## API

Also, you can see the implemented traits or the parent component.

### traverse

Returns an iterator over the tree items based on the given arguments.
The iterator returns pairs of elements `[Tree item, The bTree instance associated with the element]`.

```js
// Fold all tree items recursively
for (const [treeItem, tree] of this.$ref.tree.traverse()) {
  void tree.fold(treeItem);
}
```

```js
// Fold all sibling items of the specified tree
const
  treeRef = this.$refs.tree;

for (const [treeItem, tree] of treeRef.traverse(treeRef, {deep: false})) {
  void tree.fold(treeItem);
}
```

### fold

Folds the specified item.
If the method is called without an element passed, all tree sibling elements will be folded.

```ts
class bMyTree extends bTree {
  // All unfolded items should be folded on item click
  protected override onFoldClick(item: Item): void {
    for (const [treeItem, tree] of this.traverse(this)) {
      if (treeItem === item) {
        void tree.toggleFold(treeItem);
        continue;
      }

      void tree.fold(treeItem);
    }
  }
}
```

### unfold

Unfolds the specified item.
If method is called on nested item, all parent items will be unfolded.
If the method is called without an element passed, all tree sibling elements will be unfolded.

```ts
class AriaRole {
  onKeydown(e: KeyboardEvent): void {
    switch (e.key) {
      case '*':
        this.attrs.tree.unfold();
        break;

      // ...
    }
  }
}
```

### Props

#### [activeProp]

An initial component active item/s.
If the component is switched to the `multiple` mode, you can pass an array or Set to define several active items.

#### [autoHref = `false`]

If true, then all items without the `href` option will automatically generate a link by using `value` and other props.

#### [multiple = `false`]

If true, the component supports a feature of multiple active items.

### [folded = `true`]

If true, then all nested elements are folded by default.

### [renderFilter]

A common filter to render items via `asyncRender`.
It is used to optimize the process of rendering items.

```
< b-tree :item = 'b-checkbox' | :items = listOfItems | :renderFilter = () => async.idle()
```

### [nestedRenderFilter]

A filter to render nested items via `asyncRender`.
It is used to optimize the process of rendering child items.

```
< b-tree :item = 'b-checkbox' | :items = listOfItems | :nestedRenderFilter = () => async.idle()
```

### [renderChunks = `5`]

Number of chunks to render per tick via `asyncRender`.

```
< b-tree :item = 'b-checkbox' | :items = listOfItems | :renderChunks = 3
```
