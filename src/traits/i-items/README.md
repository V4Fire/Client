# traits/i-items

This module provides a trait for a component that renders a list of items.

The default scenario of a component that implements this trait: the component iterates over the specified list of items
and renders each item via the specified component. Take a look at [[bTree]] to see more.

## Synopsis

* This module provides an abstract class, not a component.

* The trait contains only TS logic.

## Associated types

The trait declares two associated types to specify a type of component items: **Item** and **Items**.

```typescript
import iItems from 'traits/i-items/i-items';

export default class bTree implements iItems {
  /** @see [[iItems.Item]] */
  readonly Item!: Item;

  /** @see [[iItems.Items]] */
  readonly Items!: Array<this['Item']>;
}
```

## Props

The trait specifies a bunch of optional props.

### items

This prop is used to provide a list of items to render by the component.
A type of each item is specified as `iItem['Item']`.

### item

By design, the specified items are rendered by using other components.
This prop allows specifying the name of a component that is used to render.
The prop can be provided as a function. In that case, a value is taken from the result of invoking.

```
< b-tree :items = myItems | :item = 'b-checkbox'
< b-tree :items = myItems | :item = (item, i) => i === 0 ? 'b-checkbox' : 'b-button'
```

### itemProps

This prop allows specifying props that are passed to a component to render an item.
The prop can be provided as a function. In that case, a value is taken from the result of invoking.

```
< b-tree :items = myItems | :item = 'b-checkbox' | :itemProps = {name: 'foo'}
< b-tree :items = myItems | :item = 'b-checkbox' | :itemProps = (item, i) => i === 0 ? {name: 'foo'} : {name: 'bar'}
```

### itemsIterator

The prop allows specifying a function that takes a list of items to render and returns a new one (or the original).
I.e., you can filter or modify values, or provided them to the async render function.

```
< b-tree :items = myItems | :item = 'b-checkbox' | :itemsIterator = (items) => asyncRender.iterate(items, 5)
```

### itemKey

To optimize the re-rendering of items, we can specify the unique identifier for each item.
The prop value can be provided as a string or function. In the string case, you are providing the name of a property that stores the identifier.
If the function case, you should return from the function a value of the identifier.

```
< b-tree :items = myItems | :item = 'b-checkbox' | :itemKey = '_id'
< b-tree :items = myItems | :item = 'b-checkbox' | :itemKey = (item, i) => item._id
```
