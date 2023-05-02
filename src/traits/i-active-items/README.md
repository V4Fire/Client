# traits/i-active-items

This module provides a trait that extends [[iItems]] and adds the ability to set an "active" item.

## Synopsis

* This module provides an abstract class, not a component.

* The trait contains TS logic.

## Associated types

The trait declares an associated type to specify the active item: **Active**.

## Events

| EventName         | Description                                                                                                                     | Payload description                    | Payload  |
|-------------------|---------------------------------------------------------------------------------------------------------------------------------|----------------------------------------|----------|
| `change`          | The active item of the component has been changed                                                                               | Active value or a set of active values | `Active` |
| `immediateChange` | The active item of the component has been changed (the event can fire on component initialization if `activeProp` is specified) | Active value or a set of active values | `Active` |
| `actionChange`    | The active item of the component has been changed due to some user action                                                       | Active value or a set of active values | `Active` |

## Props

The trait specifies a bunch of optional props.

### [active]

The active item(s) of the component.
If the component is switched to "multiple" mode, you can pass in an array to define multiple active items.

```
< b-tree :items = [{value: 0, label: 'Foo'}, {value: 1, label: 'Bar'}] | :active = 0
```

### [multiple]

f true, the component supports the multiple active items feature.

### [cancelable]

If set to true, the active item can be canceled by clicking it again.
By default, if the component is switched to the `multiple` mode, this value is set to `true`,
otherwise it is set to `false`.

## Fields

### [activeStore]

Store for the active item(s) of the component.

## Getters

### active

The active item(s) of the component.
If the component is switched to "multiple" mode, the getter will return a Set.

```typescript
import iActiveItems from 'traits/i-active-items/i-active-items';

export default class bCustomList implements iActiveItems {
  /** {@link iActiveItems.prototype.active} */
  get active(): iActiveItems['active'] {
    return iActiveItems.getActive(this.top ?? this);
  }

  /** {@link iActiveItems.prototype.active} */
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

Returns the active item(s) of the passed component.

### setActive

Activates the item(s) by the specified value(s).
If the component is switched to the `multiple` mode, the method can take a Set to set multiple items.

### unsetActive

Deactivates the item(s) by the specified value(s).
If the component is switched to the `multiple` mode, the method can take a Set to unset multiple items.

### toggleActive

Toggles item activation by the specified value.
The methods return the new active component item(s).

## Helpers

The trait provides a bunch of static helper functions.

### linkActiveStore

Returns a `sync.link` to `activeProp` for `activeStore`.

```typescript
import { derive } from 'core/functools/trait';

import iActiveItems from 'traits/i-active-items/i-active-items';
import iData, { component, prop, system } from 'super/i-data/i-data';

import type { Item, Items, RenderFilter } from 'base/b-tree/interface';

@component()
@derive(iActiveItems)
class bTree extends iData implements iActiveItems {
  /** {@link iItems.items} */
  @prop(Array)
  readonly itemsProp: this['Items'] = [];

  /** {@link iActiveItems.activeStore} */
  @system<bTree>((o) => iActiveItems.linkActiveStore(o))
  activeStore!: iActiveItems['activeStore'];
}
```

### getActive

Returns the active item(s) of the passed component.

```typescript
import { derive } from 'core/functools/trait';

import iActiveItems from 'traits/i-active-items/i-active-items';
import iData, { component, prop, system, computed } from 'super/i-data/i-data';

import type { Item, Items, RenderFilter } from 'base/b-tree/interface';

@component()
@derive(iActiveItems)
class bTree extends iData implements iActiveItems {
  /** {@link iItems.items} */
  @prop(Array)
  readonly itemsProp: this['Items'] = [];

  /** {@link iActiveItems.activeStore} */
  @system<bTree>((o) => iActiveItems.linkActiveStore(o))
  activeStore!: iActiveItems['activeStore'];

  /** {@link iActiveItems.prototype.active} */
  @computed({cache: true, dependencies: ['top.activeStore']})
  get active(): iActiveItems['active'] {
    return iActiveItems.getActive(this.top ?? this);
  }
}
```

### initItem

Checks if the passed item has an active property value.
If true, sets it as the component active value.

```typescript
import { derive } from 'core/functools/trait';

import iActiveItems from 'traits/i-active-items/i-active-items';
import iData, { component, prop, system, hook } from 'super/i-data/i-data';

import type { Item, Items, RenderFilter } from 'base/b-tree/interface';

@component()
@derive(iActiveItems)
class bTree extends iData implements iActiveItems {
  /** {@link iItems.items} */
  @prop(Array)
  readonly itemsProp: this['Items'] = [];

  /** {@link iActiveItems.activeStore} */
  @system<bTree>((o) => iActiveItems.linkActiveStore(o))
  activeStore!: iActiveItems['activeStore'];

  /** {@link iActiveItems.prototype.initComponentValues} */
  @hook('beforeDataCreate')
  initComponentValues(): void {
    if (this.top == null) {
      this.values = new Map();
      this.indexes = {};
      this.valuesToItems = new Map();

    } else {
      this.values = this.top.values;
      this.indexes = this.top.indexes;
      this.valuesToItems = this.top.valuesToItems;
    }

    this.field.get<this['Items']>('items')?.forEach((item) => {
      if (this.values.has(item.value)) {
        return;
      }

      const
        {value} = item;

      const
        id = this.values.size;

      this.values.set(value, id);
      this.indexes[id] = value;
      this.valuesToItems.set(value, item);

      iActiveItems.initItem(this, item);
    });
  }
}
```
