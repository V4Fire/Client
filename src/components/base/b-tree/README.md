# components/base/b-tree

This module provides a component to render a recursive tree of elements.

## Synopsis

* The component extends [[iData]].

* The component implements the [[iActiveItems]] trait.

* By default, the component's root tag is set to `<div>`.

## Features

* Recursive rendering of any components.

* Folding of branches.

## Events

| EventName      | Description                                                                  | Payload description                        | Payload               |
|----------------|------------------------------------------------------------------------------|--------------------------------------------|-----------------------|
| `fold`         | One of the component items has been folded                                   | A link to the DOM element; The item object | `Item`; `HTMLElement` |
| `unfold`       | One of the component items has been unfolded                                 | A link to the DOM element; The item object | `Item`; `HTMLElement` |
| `change`       | The active element of the component has been changed                         | The active item(s)                         | `Active`              |
| `actionChange` | The active element of the component has been changed due to some user action | The active item(s)                         | `Active`              |

See the [[iActiveItems]] trait and the [[iData]] component.

## Associated types

The component has two associated types to specify the active component item(s): **ActiveProp** and **Active**.

```typescript
import bTree, { component } from 'components/super/b-tree/b-tree';

@component()
export default class MyTree extends bTree {
  declare readonly ActiveProp: CanIter<number>;

  declare readonly Active: number | Set<number>;
}
```

In addition, there are associated types to specify the item types: **Item** and **Items**.

```typescript
import bTree, { component } from 'components/super/b-tree/b-tree';

@component()
export default class MyTree extends bTree {
  declare readonly Item: MyItem;
}
```

Also, you can see the parent component.

## Usage

### Simple use of a component with a provided list of items and components to render

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

### Providing active items

```
< b-tree &
  /// The specified items are rendered as `b-checkbox`-es
  :item = 'b-checkbox' |
  :active = ['foo', 'bar']
  :multiple = true
  :items = [
    {value: 'foo'},
    {value: 'bar', children: [
      {value: 'fooone'},
      {value: 'footwo'},
      {value: 'foosix'}
    ]}
  ]
.
```

### Providing extra attributes to a component to render

```
< b-tree &
  :item = 'b-checkbox' |
  :itemProps = (el, i, params) => el.value === 'foo' ? {label: 'foo'} : {} |
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
  :item = (el, i) => el.value === 'foo' ? 'b-checkbox' : 'b-radio-button' |
  :items = listOfItems
.
```

### Providing a component to render via a slot

```
< b-tree :items = listOfItems
  < template #default = {item}
    < b-checkbox v-if = item.value === 'foo'
    < b-radio-button v-else
```

### Loading items from a data provider

```
< b-tree :item = 'b-checkbox' | :dataProvider = 'MyProvider'
```

## Branch Folding

The module supports the function of collapsing the child branches of each item.
This is implemented using CSS modifiers, and by default elements do not have styles.
Thus, you need to write some CSS rules to hide child items when the item node has the `folded` modifier.

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
To change this, provide the modifier values as a prop.

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

      /// This branch isn't folded
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

The component supports a bunch of slots to provide.

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
       < .&__fold v-attrs = o.params
         ➕
   ```

## API

Additionally, you can view the implemented traits or the parent component.

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

### [folded]

If true, then all nested elements are folded by default.

### [activeProp]

The active element(s) of the component.
If the component is switched to "multiple" mode, you can pass in an iterable object to define multiple active elements.

### [multiple = `false`]

If true, the component supports the multiple active items feature.

### [cancelable]

If set to true, the active item can be canceled by clicking it again.
By default, if the component is switched to the `multiple` mode, this value is set to `true`,
otherwise it is set to `false`.

### [lazyRender = `'folded'`]

This option enables lazy rendering mode for the tree.
Lazy rendering is extremely useful when displaying large trees
and can have a dramatic effect on the rendering speed of the component.

Lazy rendering has several operating strategies:

1. `'folded'` - In this mode, collapsed nodes will not be rendered.
   This is the default strategy.

2. `'items'` - In this mode, all nodes of the tree are rendered asynchronously using asyncRender.
   You can fine-tune the rendering strategy using the `renderFilter`, `nestedRenderFilter`,
   and `renderChunks` props.
   Please note that in this rendering mode, the tree may "flicker" during complete redrawing.

3. `'all'` - In this mode, the tree is rendered fully lazily, essentially combining the `folded` and `items` modes.

Also, for backward compatibility, this prop can accept boolean values:

1. `false` - lazy rendering is disabled.
2. `true` - lazy rendering in the `'items'` mode.

### [renderFilter]

A common filter to render items via `asyncRender`.
It is used to optimize the rendering process for items.
This option only works in `lazyRender` mode.

```
< b-tree :item = 'b-checkbox' | :items = listOfItems | :renderFilter = () => async.idle()
```

### [nestedRenderFilter]

A filter to render nested items via `asyncRender`.
It is used to optimize the rendering process for child items.
This option only works in `lazyRender` mode.

```
< b-tree :item = 'b-checkbox' | :items = listOfItems | :nestedRenderFilter = () => async.idle()
```

### [renderChunks = `5`]

How many sections of items will be rendered at a time using `asyncRender`.
This option only works in `lazyRender` mode.

```
< b-tree :item = 'b-checkbox' | :items = listOfItems | :renderChunks = 3
```
