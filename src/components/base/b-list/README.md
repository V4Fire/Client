# components/base/b-list

This module provides a standard component for creating a list of tabs/links.
You can use it "as is" or as a superclass.

The component uses `<a>` or `<button>` tags with a simple text label to display each element.
If you need a more complex layout, provide it via a slot or `item/itemProps` props.

## Synopsis

* The component extends [[iData]].

* The component implements [[iVisible]], [[iWidth]], [[iActiveItems]] traits.

* The component is used as functional if there is no provided the `dataProvider` prop.

* The component supports tooltips.

* The component uses `aria` attributes.

* By default, the list will be created using `<ul>` and `<li>` tags.

## Features

* Support for links and tabs.

* Multiple active items (`multiple = true`).

* Cancel selection (`cancelable = true`).

* Dynamic data loading.

## Modifiers

| Name         | Description                | Values    | Default |
|--------------|----------------------------|-----------|---------|
| `hideLabels` | The item labels are hidden | `boolean` | `false` |

Also, you can see the parent component and the component traits.

## Events

| EventName      | Description                                                                     | Payload description | Payload  |
|----------------|---------------------------------------------------------------------------------|---------------------|----------|
| `change`       | The active element(s) of the component has been changed                         | The active item(s)  | `Active` |
| `actionChange` | The active element(s) of the component has been changed due to some user action | The active item(s)  | `Active` |
| `itemsChange`  | The list of component items has been changed                                    | The list of items   | `Items`  |

Also, you can see the parent component and the component traits.

## Associated types

The component has two associated types to specify the active component item(s): **ActiveProp** and **Active**.

```typescript
import bList, { component } from 'components/super/b-list/b-list';

@component()
export default class MyList extends bList {
  declare readonly ActiveProp: CanIter<number>;

  declare readonly Active: number | Set<number>;
}
```

In addition, there are associated types to specify the item types: **Item** and **Items**.

```typescript
import bList, { component } from 'components/super/b-list/b-list';

@component()
export default class MyList extends bList {
  declare readonly Item: MyItem;
}
```

Also, you can see the parent component.

## Model

The component can be used with the `v-model` directive.

```
< b-list :items = items | v-model = activeItem
```

## Usage

### Using a component with a provided list of elements and a default active element

```
< b-list :items = [ &
  {label: 'Male', value: 0, active: true},
  {label: 'Female', value: 1}
] .
```

### Using a component with a provided active item

```
< b-list :active = 0 | :items = [ &
  {label: 'Male', value: 0},
  {label: 'Female', value: 1}
] .
```

### Using a component with provided links and custom attributes

```
< b-list :items = [ &
  {label: 'Home', href: '/home'},
  {label: 'Google', href: 'https://google.com', attrs: {target: '_blank'}}
] .
```

### Loading component items from a data provider

```
< b-list :active = true | :dataProvider = 'MyProvider'
```

### Using a component with creating an additional component for each element

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

### Providing a key to an internal `v-for` directive

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

The component supports a bunch of slots to provide.

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

   Also, these icons can be provided by props.

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

Additionally, you can view the implemented traits or the parent component.

### Props

#### [activeProp]

The active element(s) of the component.
If the component is switched to "multiple" mode, you can pass in an iterable to define multiple active elements.

#### [autoHref = `false`]

If true, then all items without the `href` option will automatically generate a link by using `value` and other props.

#### [multiple = `false`]

If true, the component supports the multiple active items feature.

#### [cancelable]

If set to true, the active item can be canceled by clicking it again.
By default, if the component is switched to the `multiple` mode, this value is set to `true`, otherwise it is set to `false`.

#### [attrsProp]

Additional attributes that are provided to the native list tag.

#### [listTag = `'ul'`]

List root tag type.

#### [listElTag = `'li'`]

List element tag type.

### Fields

#### items

A list of the component items.

### Getters

#### active

A component active item(s).
If the component is switched to the `multiple` mode, the getter will return a `Set` object.

#### attrs

The active element(s) of the component.
If the component is switched to "multiple" mode, the getter will return a Set.

### Methods

#### isActive

Returns true if the specified value is active.

```typescript
class Test extends iData {
  declare protected readonly $refs: iData['$refs'] & {
    list: bList
  };

  test(): void {
    this.$refs.list.setActive(1);
    console.log(this.$refs.list.isActive(1));
  }
}
```

#### setActive

Activates the item(s) by the specified value(s).
If the component is switched to the `multiple` mode, the method can take an iterable to set multiple items.

```typescript
class Test extends iData {
  declare protected readonly $refs: iData['$refs'] & {
    list: bList
  };

  test(): void {
    this.$refs.list.setActive(1);
  }
}
```

#### unsetActive

Deactivates the item(s) by the specified value(s).
If the component is switched to the `multiple` mode, the method can take an iterable to unset multiple items.

```typescript
class Test extends iData {
  declare protected readonly $refs: iData['$refs'] & {
    list: bList
  };

  test(): void {
    this.$refs.list.unsetActive(1);
  }
}
```

#### toggleActive

Toggles activation of the item(s) by the specified value(s).
The methods return a new active component item(s).

```typescript
class Test extends iData {
  declare protected readonly $refs: iData['$refs'] & {
    list: bList
  };

  test(): void {
    console.log(this.$refs.list.toggleActive(1) === this.$refs.list.active);
  }
}
```
