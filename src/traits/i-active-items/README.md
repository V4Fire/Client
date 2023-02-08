# traits/i-active-items

This module provides a trait for a component that renders a list of items and needs a behavior of changing active items.
This trait is an extension of [[iItems]].

Take a look at [[bList]] to see more.

## Synopsis

* This module provides an abstract class, not a component.

* The trait contains TS logic.

## Associated types

The trait declares associated type to specify a type of component active item: **Active**.

## Events

| EventName         | Description                                                                                                                 | Payload description                   | Payload  |
|-------------------|-----------------------------------------------------------------------------------------------------------------------------|---------------------------------------|----------|
| `change`          | An active item of the component has been changed                                                                            | Active value or a set of active items | `Active` |
| `immediateChange` | An active item of the component has been changed (the event can fire at component initializing if `activeProp` is provided) | Active value or a set of active items | `Active` |
| `actionChange`    | An active item of the component has been changed due to some user action                                                    | Active value or a set of active items | `Active` |

Component needs to support `change`, `immediateChange`, `actionChange` events in methods, in description of which it is indicated.

## Props

The trait specifies a bunch of optional props.

### [active]

An initial component active item/s value.
If the component is switched to the `multiple` mode, you can pass an array or `Set` to define several active items.

```snakeskin
< b-tree :items = [{value: 0, label: 'Foo'}, {value: 1, label: 'Bar'}] | :active = 0
```

### [multiple]

If true, the component supports a feature of multiple active items.

### [cancelable]

If true, the active item can be unset by using another click to it.
By default, if the component is switched to the `multiple` mode, this value is set to `true`,
otherwise to `false`.

## Internal fields

### [activeStore]

A component active item/s value.
If the component is switched to the `multiple` mode, the value is defined as a `Set` object.

### [indexes]

Map of item values and their indexes

### [values]

An internal component active item store.
If the component is switched to the `multiple` mode, the value is defined as a `Set` object.

## Accessors

### activeElement

A link to the active item element.
If the component is switched to the `multiple` mode, the getter will return an array of elements.

```typescript
import iActiveItems from 'traits/i-active-items/i-active-items';

export default class bCustomList implements iActiveItems {
  /** @see iAccess.prototype.activeElement */
  get activeElement(): iActiveItems['activeElement'] {
    return iActiveItems.getActiveElement(this, 'link');
  }
}
```

### active

Getter and setter of a component active item/s.
If the component is switched to the `multiple` mode, the getter will return a `Set` object.

```typescript
import iActiveItems from 'traits/i-active-items/i-active-items';

export default class bCustomList implements iActiveItems {
  /** @see [[iActiveItems.prototype.active] */
  get active(): iActiveItems['active'] {
    return iActiveItems.getActive(this.top ?? this);
  }

  /** @see [[iActiveItems.prototype.active] */
  set active(value: this['Active']) {
    (this.top ?? this).field.set('activeStore', value);
  }
}
```

## Methods

The trait specifies a bunch of methods to implement.

### isActive

Returns true if the specified value is active.

```typescript
import iActiveItems from 'traits/i-active-items/i-active-items';

export default class bCustomList implements iActiveItems {
  /** @see iAccess.prototype.activeElement */
  isActive(value: Item['value']): boolean {
    return iActiveItems.isActive(this);
  }
}
```

### setActive

Activates an item by the specified value.
If the component is switched to the `multiple` mode, the method can take a `Set` object to set multiple items.
The method should emit `immediateChange` and `change` events.
To add item to active store `iActiveItems.addToActiveStore` method could be used.

```typescript
import iActiveItems from 'traits/i-active-items/i-active-items';

export default class bCustomList implements iActiveItems {
  /** @see iAccess.prototype.setActive */
  setActive(value: Item['value'] | Set<Item['value']>, unsetPrevious?: boolean): boolean {
    iActiveItems.addToActiveStore(this);

		//some logic//

    this.emit('immediateChange', this.active);
    this.emit('change', this.active);

		return true;
  }
}
```

### unsetActive

Deactivates an item by the specified value.
If the component is switched to the `multiple` mode, the method can take a `Set` object to unset multiple items.
The method should emit `immediateChange` and `change` events.
To remove item from active store `iActiveItems.removeFromActiveStorage` method could be used.

```typescript
import iActiveItems from 'traits/i-active-items/i-active-items';

export default class bCustomList implements iActiveItems {
  /** @see iAccess.prototype.unsetActive */
  unsetActive(value: Item['value'] | Set<Item['value']>): boolean {
    iActiveItems.removeFromActiveStorage(this);

    //some logic//

    this.emit('immediateChange', this.active);
    this.emit('change', this.active);

    return true;
  }
}
```

### toggleActive

Toggles activation of an item by the specified value.
The methods return a new active component item/s.
The method should emit `immediateChange` and `change` events.

```typescript
import iActiveItems from 'traits/i-active-items/i-active-items';

export default class bCustomList implements iActiveItems {
  /** @see iAccess.prototype.toggleActive */
  toggleActive(value: Item['value'], unsetPrevious?: boolean): iActiveItems['Active'] {
    //some logic//

    this.emit('immediateChange', this.active);
    this.emit('change', this.active);

    return true;
  }
}
```

### initComponentValues

Initializes component values. Fills a `Map` and an `Array` of values and there indexes for internal use.
Also `iActiveItems.initItemMods` should be used to add required mods to item

```typescript
import iActiveItems from 'traits/i-active-items/i-active-items';

export default class bCustomList implements iActiveItems {
  /** @see [[iActiveItems.prototype.initComponentValues]] */
  @hook('beforeDataCreate')
  initComponentValues(): void {
    for (let i = 0; i < this.items.length; i++) {
      const
        item = this.items[i],
        val = item.value;

      this.values.set(val, i);
      this.indexes[i] = val;

      iActiveItems.initItemMods(this, item);
    }
  }
}
```

## Helpers

The trait provides a bunch of helper functions.

### getActive

Returns active item/s.
See `active`.

### getActiveElement

Returns active item element/s
See `activeElement`.

### initItemMods

Initializes component mods
See `initComponentValues`.

### addToActiveStore

Adds the specified value to the component's active store
See `setActive`.

### removeFromActiveStorage

Removes the specified value from the component's active store
See `unsetActive`.

