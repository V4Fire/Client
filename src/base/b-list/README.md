# base/b-list

This module provides a standard component to create a list of tabs/links. You can use it "as it is" or like a superclass.

## Synopsis

* The component extends [[iData]].

* The component implements [[iVisible]], [[iWidth]] traits.

* The component is used as functional if there is no provided the `dataProvider` prop.

* The component supports tooltips.

* By default, the list will be created using `<ul>` and `<li>` tags.

## Features

* Support of links and tabs.

* Multiple values (`multiple = true`).

* Cancelation of a choice (`cancelable = true`).

* Dynamic data loading.

## Modifiers

| Name         | Description            | Values    | Default |
| ------------ | ---------------------- | ----------| ------- |
| `hideLabels` | Item labels is hidden  | `Boolean` | `false` |

Also, you can see [[iVisible]] and [[iWidth]] traits and the [[iData]] component.

## Events

| EventName         | Description                                                                                                                  | Payload description                    | Payload  |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- | -------- |
| `change`          | An active value of the component has been changed                                                                            | Active value or a set of active values | `Active` |
| `immediateChange` | An active value of the component has been changed (the event can fire at component initializing if `activeProp` is provided) | Active value or a set of active values | `Active` |
| `actionChange`    | An active value of the component has been changed due to some user action                                                    | Active value or a set of active values | `Active` |
| `itemsChange`     | A list of items has been changed                                                                                             | List of items                          | `Items`  |

Also, you can see [[iVisible]] and [[iWidth]] traits and the [[iData]] component.

## Associated types

The component has one associated types to specify a type of component items: **Items**.

```typescript
import bList, { component } from 'super/b-list/b-list';

export * from 'super/b-list/b-list';

@component()
export default class myList extends bList {
  /** @override */
  readonly Items!: MyItems;
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

1. Simple use of the component with a provided list of items and the default active value.

```
< b-list :items = [ &
  {label: 'Male', value: 0, active: true},
  {label: 'Female', value: 1}
] .
```

2. Use of the component with the providing of the active value.

```
< b-list :active = 0 | :items = [ &
  {label: 'Male', value: 0},
  {label: 'Female', value: 1}
] .
```

3. Use of the component with the providing of links and custom attributes.

```
< b-list :items = [ &
  {label: 'Home', href: '/home'},
  {label: 'Google', href: 'https://google.com', attrs: {target: '_blank'}}
] .
```

4. Loading items from a data provider.

```
< b-list :active = true | :dataProvider = 'MyProvider'
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

2. `progressIcon` to inject an icon that indicates loading each item, by default, is used [[bProgressIcon]].

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

