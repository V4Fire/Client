# components/traits/i-items

This module provides a trait for a component that renders a list of items.
The default scenario of a component that implements this trait: the component iterates over the specified list of items
and renders each item as a component. Take a look at [[bTree]] or [[bList]] to see more.

## Synopsis

* This module provides an abstract class, not a component.

* The trait contains only TS logic.

## Associated types

The trait declares two associated types to specify a type of component items: **Item** and **Items**.

```typescript
import iItems from 'components/traits/i-items/i-items';
import iBlock, { component } from 'components/super/i-block/i-block';

@component()
export default class bTree extends iBlock implements iItems {
  /** {@link iItems.Item} */
  readonly Item!: Item;

  /** {@link iItems.Items} */
  readonly Items!: Array<this['Item']>;
}
```

## Props

The trait specifies a bunch of optional props.

### [items]

This prop is used to provide a list of items to render by the component.
A type of each item is specified as `iItem['Item']`.

### [item]

By design, the specified items are rendered by using other components.
This prop allows specifying the name of a component that is used for rendering.
The prop can be provided as a function. In that case, the value is taken from the call result.

```
< b-tree :items = myItems | :item = 'b-checkbox'
< b-tree :items = myItems | :item = (item, i) => i === 0 ? 'b-checkbox' : 'b-button'
```

### [itemProps]

This prop allows specifying props that are passed to a component to render items.
The prop can be provided as a function. In that case, the value is taken from the call result.

```
< b-tree :items = myItems | :item = 'b-checkbox' | :itemProps = {name: 'foo'}
< b-tree :items = myItems | :item = 'b-checkbox' | :itemProps = (item, i) => i === 0 ? {name: 'foo'} : {name: 'bar'}
```

### [itemKey]

To optimize the re-rendering of items, we can specify a unique identifier for each item.

The prop value can be provided as a string or a function.
In the case of a string, you are providing the property name that stores the identifier.
If the case of a function, you must return the identifier value from the function.

```
< b-tree :items = myItems | :item = 'b-checkbox' | :itemKey = '_id'
< b-tree :items = myItems | :item = 'b-checkbox' | :itemKey = (item, i) => item._id
```

## Helpers

The trait provides a static helper function to resolve the value of the `itemKey` prop: if the value is passed as a string,
it will be compiled as a function. The method returns the value of the `itemKey` function call, or undefined (if it is not specified).

```typescript
import iItems, { IterationKey } from 'components/traits/i-items/i-items';
import iBlock, { component } from 'components/super/i-block/i-block';

export default class bTree extends iBlock implements iItems {
  /** {@link iItems.getItemKey} */
  protected getItemKey(el: this['Item'], i: number): CanUndef<IterationKey> {
    return iItems.getItemKey(this, el, i);
  }
}
```
