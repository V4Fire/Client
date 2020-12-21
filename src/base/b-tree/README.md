# base/b-tree

This module provides API to render a recursive list of elements.

## Synopsis

* The component extends [[iData]].

* The component implements the [[iItems]] traits.

* The component can be used as flyweight.

* By default, the root tag of the component is `<div>`.

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

The component has one associated types to specify a type of component items: **Items**.

```typescript
import bTree, { component } from 'super/b-tree/b-tree';

export * from 'super/b-list/b-list';

@component()
export default class myTree extends bTree {
  /** @override */
  readonly Items!: MyItems;
}
```

## Usage

Create a component with the specified `items` prop. `items` is an array of objects where every object implements the `Item` interface.

```
interface Item extends Dictionary {
  /**
   * Item identifier
   */
  id: string;

  /**
   * List of nested items
   */
  children?: Item[];

  /**
   * False, if the item shouldn't be folded by default
   * @default `true`
   */
  folded?: boolean;
}
```

After this, you can specify a component that should use to render items. To do this, you have to provide the `item` prop.
The prop value can be defined as a string or function that returns a string.

```
< b-tree &
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

```
< b-tree &
  :item = (el, i) => el.id === 'foo' ? 'b-checkbox' : 'b-radio-button' |
  :items = [
    {id: 'foo'},

    {
      id: 'bar',
      children: [
        {id: 'fooone'},
        {id: 'footwo'}
      ]
    }
  ]
.
```

### Providing of the component to render via a slot

If you want to have more control of rendering items, you can specify the default slot that will be used to render each item.

```
< b-tree :options = [
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
  ]}
] .
  < template #default = {item}
    < b-checkbox v-if = item.id === 'foo'
    < b-radio-button v-else
```

## Branch Folding

The module supports a feature to fold child branches of an item. It is implemented by using CSS modifiers, and by default,
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
      folded: false,
      children: [
        {id: 'fooone'},
        {id: 'footwo'}
      ]
    }
  ]
.
```

### Customization

You can also customize a folding element.
To do this, pass scoped slot `fold` with custom content and set the `params` field with the `v-attrs` property.

Example:

```
< template #fold = o
  < .&__fold :v-attrs = o.params
    ➕
```

### External render parameters

Module renders elements with `asyncRender` of the tree root node with default rendering function.
See the [[AsyncRender]] class for additional information.

#### Render filter

If you need to set an external filter function for the tree render, pass it to the `renderFilter` property.
Also, you can set a separate filter function for nested items. To do this, pass a function to `nestedRenderFilter` property.

#### Chunks count

Set custom value to `renderChunks` property to redefine default chunks count for the `asyncRender`.
