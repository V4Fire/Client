# traits/i-active-items

This module provides a trait that extends [[iItems]] and adds the ability to set an "active" item.
Take a look at [[bTree]] or [[bList]] to see more.

## Synopsis

* This module provides an abstract class, not a component.

* The trait contains TS logic.

* The trait extends [[iItems]] and re-exports its API.

* The trait can be partially derived.

  ```typescript
  import { derive } from 'components/traits';

  import iActiveItems from 'traits/i-active-items/i-active-items';
  import iBlock, { component } from 'components/super/i-block/i-block';

  interface bTree extends Trait<typeof iOpen> {}

  @component()
  @derive(iOpen)
  class bTree extends iBlock implements iActiveItems {
    /** {@link iActiveItems.activeChangeEvent} */
    readonly activeChangeEvent: string = 'change';

    /** {@link iActiveItems.activeStore} */
    @system((o) => iActiveItems.linkActiveStore(o))
    activeStore!: iActiveItems['activeStore'];
  }

  export default bTree;
  ```

## Associated types

The trait declares associated types to specify the active item: **ActiveProp** and **Active**.

```typescript
import iActiveItems, { Active, ActiveProp } from 'traits/i-active-items/i-active-items';
import iBlock, { component } from 'components/super/i-block/i-block';

@component()
export default class bTree extends iBlock implements iActiveItems {
  /** {@link [iActiveItems.ActiveProp]]} */
  readonly ActiveProp!: ActiveProp;

  /** {@link [iActiveItems.Active]]} */
  readonly Active!: Active;
}
```

See also the [[items]] trait.

## Item properties

The trait introduces a contract for some fields of the item object.

### value

Item value. The value is used to set the activity of a particular item through special methods.

### active

Indicates whether the item is active by default.

### activatable

Indicates whether the element can be active.
This property is checked before calling the `toggleActive` and `setActive` methods.

## Events

| EventName      | Description                                                               | Payload description                    | Payload  |
|----------------|---------------------------------------------------------------------------|----------------------------------------|----------|
| `change`       | The active item of the component has been changed                         | Active value or a set of active values | `Active` |
| `actionChange` | The active item of the component has been changed due to some user action | Active value or a set of active values | `Active` |

Keep in mind these are recommended event names. Each consumer must declare its own event name by setting the `activeChangeEvent` property.

```typescript
import iActiveItems from 'traits/i-active-items/i-active-items';
import iBlock, { component } from 'components/super/i-block/i-block';

export default class bTree extends iBlock implements iActiveItems {
  readonly activeChangeEvent: string = 'change';
}
```

## Props

The trait specifies a bunch of optional props.

### [activeProp]

The active item(s) of the component.
If the component is switched to "multiple" mode, you can pass in an iterable to define multiple active elements.

```
< b-tree :items = [{value: 0, label: 'Foo'}, {value: 1, label: 'Bar'}] | :active = 0
```

### [multiple]

If true, the component supports the multiple active items feature.

### [cancelable]

If set to true, the active item can be canceled by clicking it again.
By default, if the component is switched to the `multiple` mode, this value is set to `true`, otherwise it is set to `false`.

## Fields

### [activeStore]

The component internal active item store.
If the component is switched to the `multiple` mode, the value is defined as a Set.

## Getters

### active

The active item(s) of the component.
If the component is switched to "multiple" mode, the getter will return a Set.

```typescript
import iActiveItems from 'traits/i-active-items/i-active-items';
import iBlock, { component } from 'components/super/i-block/i-block';

@component()
export default class bTree extends iBlock implements iActiveItems {
  /** {@link [iActiveItems.active]} */
  get active(): iActiveItems['active'] {
    return iActiveItems.getActive(this.top ?? this);
  }

  /** {@link [iActiveItems.active]} */
  set active(value: this['Active']) {
    (this.top ?? this).field.set('activeStore', value);
  }
}
```

### activeElement

Link(s) to the DOM element of the component active item.
If the component is switched to the `multiple` mode, the getter will return a list of elements.

## Methods

The trait specifies a bunch of methods to implement.

### isActive

Returns true if the item by the specified value is active.

### setActive

Activates the item(s) by the specified value(s).
If the component is switched to the `multiple` mode, the method can take a Set to set multiple items.

### unsetActive

Deactivates the item(s) by the specified value(s).
If the component is switched to the `multiple` mode, the method can take a Set to unset multiple items.

### toggleActive

Toggles item activation by the specified value.
The methods return the new active component item(s).

### getItemByValue

Returns an item object by the specified value.

## Helpers

The trait provides a bunch of static helper functions.

### linkActiveStore

Creates a link between `activeProp` and `activeStore` and returns the result

```typescript
import iActiveItems from 'traits/i-active-items/i-active-items';
import iBlock, { component, prop, system } from 'super/i-block/i-block';

@component()
class bTree extends iBlock implements iActiveItems {
  /** {@link [iActiveItems.activeProp]]} */
  @prop({required: false})
  readonly activeProp?: this['ActiveProp'];

  /** {@link [iActiveItems.activeStore]]} */
  @system((o) => iActiveItems.linkActiveStore(o))
  activeStore!: iActiveItems['activeStore'];
}
```

### isActivatable

Checks if an item can possibly be active by its value.

### getActive

Returns the active item(s) of the passed component.

```typescript
import iActiveItems from 'traits/i-active-items/i-active-items';
import iBlock, { component, computed } from 'super/i-block/i-block';

@component()
class bTree extends iBlock implements iActiveItems {
  /** {@link [iActiveItems.active]} */
  @computed({cache: true, dependencies: ['top.activeStore']})
  get active(): iActiveItems['active'] {
    return iActiveItems.getActive(this);
  }
}
```

### initItem

Checks if the passed element has an activity property.
If true, sets it as the component active value.

```typescript
import iActiveItems from 'traits/i-active-items/i-active-items';
import iBlock, { component, hook } from 'super/i-block/i-block';

@component()
class bTree extends iBlock implements iActiveItems {
  @hook('beforeDataCreate')
  initComponentValues(): void {
    this.field.get<this['Items']>('items')?.forEach((item) => {
      iActiveItems.initItem(this, item);
    });
  }
}
```

### initActiveStoreListeners

Initializes active store change listeners.

```typescript
import iActiveItems from 'traits/i-active-items/i-active-items';
import iBlock, { component, hook } from 'super/i-block/i-block';

@component()
class bTree extends iBlock implements iActiveItems {
  /** {@link iActiveItems.initActiveStoreListeners
  @hook('beforeDataCreate')
  protected initActiveStoreListeners(): void {
    iActiveItems.initActiveStoreListeners(this);
  }
}
```
