# components/form/b-select

This module provides a component to create a form select.
The select can contain multiple values.

## Synopsis

* The component extends [[iInputText]].

* The component implements [[iOpenToggle]], [[iActiveItems]] traits.

* The component is used as functional if there is no provided the `dataProvider` prop.

* By default, the root tag of the component is `<span>`.

* The component contains an `<input>` or `<select>` (it uses by default with mobile browsers) tag within.

* The component has `skeletonMarker`.

## Modifiers

| Name       | Description                                      | Values    | Default |
|------------|--------------------------------------------------|-----------|---------|
| `native`   | The component uses native `<select>`             | `boolean` | `false` |
| `multiple` | The component is switched to the `multiple` mode | `boolean` | `false` |

Also, you can see the parent component and the component traits.

## Events

| EventName     | Description                      | Payload description | Payload |
|---------------|----------------------------------|---------------------|---------|
| `itemsChange` | A list of items has been changed | List of items       | `Items` |
| `change`      | The active element of the component has been changed   | The active item(s) | `Active`  |
| `actionChange`| The active element of the component has been changed due to some user action          | The active item(s)               | `Active`            |

Also, you can see the parent component and the component traits.

## How to switch between the native `<select>` and custom select

By default, desktop browsers use the custom select layout based on the `<input>` and some helper tags to create dropdown menus and other elements.
In contrast, all mobile browsers use the simple native `<select>` tag. You can set the mode by using the `native` prop.
Additionally, the component has a `native` modifier. The modifier value is automatically synchronized with this prop.

```
< b-select :items = myItems | :native = true
```

Why can't we always use just one mode? The primary issue lies in customizing the select items. Within `<option>`, we can only use plain text, but at times it would be great to incorporate images or other components, such as checkboxes. Additionally, there is a challenge in customizing the appearance of these items via CSS. This is why `bSelect` mimics native behavior using custom tags. However, for mobile browsers, it is generally preferable to use the native select due to the smaller screen size and enhanced user experience.

## Usage

### A simple standalone select

```
< b-select :value = 1 | :items = [ &
  {label: 'foo', value: 0},
  {label: 'bar', value: 1}
] .
```

### A component that tied with some form

```
< b-form :dataProvider = 'Info' | :method = 'add'
  < b-select :name = 'type' | :items = [ &
    {label: 'foo', value: 0},
    {label: 'bar', value: 1}
  ] .

  < b-button :type = 'submit'
```

### Loading from a data provider

```
< b-select :dataProvide = 'MyProvider' | @onActionChange = console.log($event)
```

When a provider returns a dictionary, it gets mapped onto the component. To pass a complex property path, you can use dots as separators.

If a key from the response corresponds to a component method, this method will be invoked using the value from that key. If the value is an array, it will be spread to the method as separate arguments.

Provider should not return any properties which are in the component props list (marked with @prop decorator), they won't be updated.

```
{
  value: 0,

  items: [
    {label: 'foo', value: 0},
    {label: 'bar', value: 1}
  ],

  'mods.focused': true
}
```

In other cases, the response value is interpreted as a component value.

## Slots

The component supports several slots for customization:

1. `default` - use this slot to provide a template for a select item (option).

```
< b-select :items = myItems
  < template #default = {item}
    {{ item.label }}
```

2. `preIcon` and `icon` - use these slots to inject icons around the value block.


```
< b-select :items = myItems
  < template #preIcon
    < img src = validate.svg

  < template #icon
    < img src = clear.svg
```

Also, these icons can be provided via props.

```
< b-select :items = myItems | :icon = 'validate'

< b-select &
  :items = myItems |
  :preIcon = 'validate' |
  :iconComponent = 'b-custom-icon'
.

< b-select :items = myItems
  < template #icon = {icon}
    < img :src = icon
```

3. `progressIcon` - use this slot to inject an icon that indicates loading. By default, [[bProgressIcon]] is used.

```
< b-select :items = myItems
  < template #progressIcon
    < img src = spinner.svg
```

Also, this icon can be provided via a prop.

```
< b-select :items = myItems | :progressIcon = 'bCustomLoader'
```

## API

Check parent [[iInputText]] component and the traits.

### Props

#### [multiple = `false`]

If true, the component supports a feature of multiple selected items.

#### [native = `browser.is.mobile`]

If true, the component will use a native tag to show the select.

#### [preIcon]

An icon to show before the input.

```
< b-select :preIcon = 'dropdown' | :items = myItems
```

#### [preIconComponent]

A name of the used component to show `preIcon`.

```
< b-select :preIconComponent = 'b-my-icon' | :items = myItems
```

#### [preIconHint]

A tooltip text to show during hover the cursor on `preIcon`.

```
< b-select &
  :preIcon = 'dropdown' |
  :preIconHint = 'Show variants' |
  :items = myItems
.
```

#### [preIconHintPos]

Tooltip position to show during hover the cursor on `preIcon`.
See [[gIcon]] for more information.

```
< b-select &
  :preIcon = 'dropdown' |
  :preIconHint = 'Show variants' |
  :preIconHintPos = 'bottom-right' |
  :items = myItems
.
```

#### [icon]

An icon to show after the input.

```
< b-select :icon = 'dropdown' | :items = myItems
```

#### [iconComponent]

A name of the used component to show `icon`.

```
< b-select :iconComponent = 'b-my-icon' | :items = myItems
```

#### [iconHint]

A tooltip text to show during hover the cursor on `icon`.

```
< b-select &
  :icon = 'dropdown' |
  :iconHint = 'Show variants' |
  :items = myItems
.
```

#### [iconHintPos]

Tooltip position to show during hover the cursor on `icon`.
See [[gIcon]] for more information.

```
< b-select &
  :icon = 'dropdown' |
  :iconHint = 'Show variants' | :
  :iconHintPos = 'bottom-right' |
  :items = myItems
.
```

### [progressIcon]

A component to show "in-progress" state or
Boolean, if needed to show progress by slot or `b-progress-icon`.

```
< b-select :progressIcon = 'b-my-progress-icon' | :items = myItems
```

### Fields

#### items

List of component items.

### Methods

#### isSelected

Returns true if the specified value is selected.

```typescript
class Test extends iData {
  /** @override */
  protected $refs!: {
    select: bSelect
  };

  test(): void {
    this.$refs.select.value = 1;
    console.log(this.$refs.select.isSelected(1));
  }
}
```

#### selectValue

Selects an item by the specified value.
If the component is switched to the `multiple` mode, the method can take a `Set` object to set multiple items.

```typescript
class Test extends iData {
  /** @override */
  protected $refs!: {
    select: bSelect
  };

  test(): void {
    this.$refs.select.selectValue(1);
  }
}
```

#### unselectValue

Removes selection from an item by the specified value.
If the component is switched to the `multiple` mode, the method can take a `Set` object to unset multiple items.

```typescript
class Test extends iData {
  /** @override */
  protected $refs!: {
    select: bSelect
  };

  test(): void {
    this.$refs.unselectValue.unselectValue(1);
  }
}
```

#### toggleValue

Toggles selection of an item by the specified value.
The methods return a new selected value/s.

```typescript
class Test extends iData {
  /** @override */
  protected $refs!: {
    select: bSelect
  };

  test(): void {
    console.log(this.$refs.select.toggleValue(1) === this.$refs.select.value);
  }
}
```

### Validation

Because the component extends from [[iInput]], it supports validation API.

```
< b-select &
  :items = myItems |
  :name = 'desc' |
  :validators = ['required'] |
  @validationEnd = handler
.
```

#### Built-in validators

The component provides a bunch of validators.

##### required

Checks that a component value must be filled.

```
< b-select :validators = ['required'] | :items = myItems
< b-select :validators = {required: {showMsg: false}} | :items = myItems
```

## Styles

1. By default, the component provides a button to expand a dropdown with items.
   You can configure it via CSS by using the `&__expand` selector.

```styl
&__expand
  size 20px
  background-image url("assets/my-icon.svg")
```

2. By default, the component provides a button to clear the input value.
   You can configure it via CSS by using the `&__clear` selector.

```styl
&__clear
  size 20px
  background-image url("assets/my-icon.svg")
```
