# base/b-list

This module provides a standard component to create a list of tabs/links.
You can use it "as it is" or like a superclass.

The component uses the `<a>` or `<button>` tags with a simple text label to render each item.
If you need a more complex layout, provide it via a slot or by using `item/itemProps` props.

## Synopsis

* The component extends [[iData]].

* The component implements [[iVisible]], [[iWidth]], [[iItems]] traits.

* The component is used as functional if there is no provided the `dataProvider` prop.

* The component supports tooltips.

* The component uses `aria` attributes.

* By default, the list will be created using `<ul>` and `<li>` tags.

## Features

* Support of links and tabs.

* Multiple active items (`multiple = true`).

* Cancellation of a choice (`cancelable = true`).

* Dynamic data loading.

## Modifiers

| Name         | Description            | Values    | Default |
|--------------|------------------------|-----------|---------|
| `hideLabels` | Item labels are hidden | `Boolean` | `false` |

Also, you can see the parent component and the component traits.

## Events

| EventName         | Description                                                                                                                 | Payload description                   | Payload  |
|-------------------|-----------------------------------------------------------------------------------------------------------------------------|---------------------------------------|----------|
| `change`          | An active item of the component has been changed                                                                            | Active value or a set of active items | `Active` |
| `immediateChange` | An active item of the component has been changed (the event can fire at component initializing if `activeProp` is provided) | Active value or a set of active items | `Active` |
| `actionChange`    | An active item of the component has been changed due to some user action                                                    | Active value or a set of active items | `Active` |
| `itemsChange`     | A list of items has been changed                                                                                            | List of items                         | `Items`  |

Also, you can see the parent component and the component traits.

## Associated types

The component has associated type to specify active component item: **Active**.

```typescript
import bList, { component } from 'super/b-list/b-list';

export * from 'super/b-list/b-list';

@component()
export default class myList extends bList {
  /** @override */
  readonly Active!: number;
}
```

There are associated types to specify a type of component items: **Item** and **Items**.

```typescript
import bList, { component } from 'super/b-list/b-list';

export * from 'super/b-list/b-list';

@component()
export default class myList extends bList {
  /** @override */
  readonly Item!: MyItem;
}
```

Also, you can see the parent component.

## Model

The component can be used with the `v-model` directive.

```
< b-list :items = items | v-model = activeItem
```

```js
({
  model: {
    prop: 'activeProp',
    event: 'onChange'
  }
})
```

## Usage

### Simple use of the component with a provided list of items and default active item

```
< b-list :items = [ &
  {label: 'Male', value: 0, active: true},
  {label: 'Female', value: 1}
] .
```

### Use of the component with the providing of an active item

```
< b-list :active = 0 | :items = [ &
  {label: 'Male', value: 0},
  {label: 'Female', value: 1}
] .
```

### Use of the component with the providing of links and custom attributes

```
< b-list :items = [ &
  {label: 'Home', href: '/home'},
  {label: 'Google', href: 'https://google.com', attrs: {target: '_blank'}}
] .
```

### Loading items from a data provider

```
< b-list :active = true | :dataProvider = 'MyProvider'
```

### Use of the component with the creation of additional component for each item

```
< b-list &
  :item = 'b-my-component' |
  :itemProps = (item) => item |
  :items = [ &
    {label: 'Male', value: 0, active: true},
    {label: 'Female', value: 1}
  ]
.
```

### Providing a key to the internal `v-for` directive

```
< b-tree &
  :itemKey = 'value' |
  :items = [ &
    {label: 'Male', value: 0, active: true},
    {label: 'Female', value: 1}
  ]
.
```

## Slots

The component supports a bunch of slots to provide:

1. `default` to provide the base content of each item.

```
< b-list :items = listOfItems
  < template #default = {item}
    {{ item.label }}
```

2. `preIcon` and `icon` to inject icons around each item.

```
< b-list :items = listOfItems
  < template #preIcon
    < img src = expand.svg
```

Also, these icons can be provided by a prop.

```
< b-list :items = [ &
  {label: 'Foo', preIcon: 'expand'}
  {label: 'Bar', icon: 'expand', iconComponent: 'b-custom-icon'}
] .

< b-list :items = listOfItems
  < template #icon = {icon, item}
    < img :src = icon
```

3. `progressIcon` to inject an icon that indicates loading each item, by default, is used [[bProgressIcon]].

```
< b-list :items = listOfItems
  < template #progressIcon
    < img src = spinner.svg
```

Also, this icon can be provided by a prop.

```
< b-list :items = [ &
  {label: 'Foo', progressIcon: 'bCustomLoader'}
] .
```

## API

Also, you can see the implemented traits or the parent component.

### Props

#### [listTag = `'ul'`]

A type of the list' root tag.

#### [listElTag = `'li'`]

A type of list' element tags.

#### [activeProp]

An initial component active item/s.
If the component is switched to the `multiple` mode, you can pass an array or Set to define several active items.

#### [autoHref = `false`]

If true, then all items without the `href` option will automatically generate a link by using `value` and other props.

#### [multiple = `false`]

If true, the component supports a feature of multiple active items.

#### [cancelable]

If true, the active item can be unset by using another click to it.
By default, if the component is switched to the `multiple` mode, this value is set to `true`, otherwise to `false`.

#### [attrsProp]

Initial additional attributes are provided to an "internal" (native) list tag.

### Fields

#### items

List of component items.

### Getters

#### active

A component active item/s.
If the component is switched to the `multiple` mode, the getter will return a `Set` object.

#### attrs

Additional attributes are provided to an "internal" (native) list tag.

### Methods

#### isActive

Returns true if the specified value is active.

```typescript
class Test extends iData {
  /** @override */
  protected $refs!: {
    list: bList
  };

  test(): void {
    this.$refs.list.setActive(1);
    console.log(this.$refs.list.isActive(1));
  }
}
```

#### setActive

Activates an item by the specified value.
If the component is switched to the `multiple` mode, the method can take a `Set` object to set multiple items.

```typescript
class Test extends iData {
  /** @override */
  protected $refs!: {
    list: bList
  };

  test(): void {
    this.$refs.list.setActive(1);
  }
}
```

#### unsetActive

Deactivates an item by the specified value.
If the component is switched to the `multiple` mode, the method can take a `Set` object to unset multiple items.

```typescript
class Test extends iData {
  /** @override */
  protected $refs!: {
    list: bList
  };

  test(): void {
    this.$refs.list.unsetActive(1);
  }
}
```

#### toggleActive

Toggles activation of an item by the specified value.
The methods return a new active component item/s.

```typescript
class Test extends iData {
  /** @override */
  protected $refs!: {
    list: bList
  };

  test(): void {
    console.log(this.$refs.list.toggleActive(1) === this.$refs.list.active);
  }
}
```
