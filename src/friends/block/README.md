# friends/block

This module provides an API to work with a component in terms of [BEM](https://en.bem.info/methodology/quick-start/).
Typically, you won't need to work with this API directly, because more convenient facades are available for it.
However, this API can be used to work with element modifiers.

## How to include this module to your component?

By default, any component that inherited from [[iBlock]] has the `block` property.
Some methods, such as `getFullBlockName`, `getMod`, `setMod`, `removeMod` are always available, and the rest must be
included explicitly to enable tree-shake code optimization. Just place the necessary import declaration within your component file.

```typescript
import iBlock, { component } from 'super/i-block/i-block';
import Block, { getElMod, setElMod } from 'friends/block';

// Import `getElMod` and `setElMod` methods
Block.addToPrototype(getElMod, setElMod);

@component()
export default class bExample extends iBlock {}
```

## Basic concepts

BEM allows us to use a component-based CSS approach to describe our widgets. If you look at it from a programming point of view,
the block is the root node of our component, and the block modifiers are its input parameters that have a contract that
they also put the necessary CSS classes. In addition to this, we can programmatically watch modifiers change using
the standard component property watching API.

### How to declare component props as modifiers?

To declare modifiers for a component, you must use the `mods` static property.
Just pass it a dictionary where keys are modifier names and values are lists of modifier values.
Modifier values are always converted to a string. However, when describing them, it is allowed to use numbers and boolean values.
Also, all modifier names and them values are forced to normalize to the dash style, so you can use whatever style you feel comfortable with.
To assign any of the values as the default, just wrap it in another array.

```typescript
import iBlock, { component, ModsDecl } from 'super/i-block/i-block';

@component()
class bExample extends iBlock {
  static mods: ModsDecl = {
    theme: [
      'dark',
      ['light']
    ],

    ieSupport: [
      [false],
      9,
      10,
      11
    ]
  };
}
```

When one component inherits from another, its modifiers are also inherited. And if you add new modifiers,
then the parent modifiers will still be inherited.

```typescript
import iBlock, { component, ModsDecl } from 'super/i-block/i-block';

@component()
class Parent extends iBlock {
  static mods: ModsDecl = {
    theme: [
      'dark',
      ['light']
    ]
  };
}

@component()
class Children extends Parent {
  // All Parent modifiers are inerited
  static mods: ModsDecl = {
    visible: [
      [true],
      false
    ]
  };
}
```

Also, you can override parent modifiers.

```typescript
import iBlock, { component, ModsDecl } from 'super/i-block/i-block';

@component()
class Parent extends iBlock {
  static mods: ModsDecl = {
    theme: [
      'dark',
      ['light']
    ]
  };
}

@component()
class Children extends Parent {
  static mods: ModsDecl = {
    theme: [
      'dark',
      'light',
      ['minimal-light']
    ]
  };
}
```

It is allowed to refer to modifier values that are inherited from the parent component.

```typescript
import iBlock, { component, ModsDecl } from 'super/i-block/i-block';

@component()
class Parent extends iBlock {
  static mods: ModsDecl = {
    theme: [
      'dark',
      ['light']
    ]
  };
}

@component()
class Children extends Parent {
  static mods: ModsDecl = {
    theme: [
      Children.PARENT,
      ['minimal-light']
    ]
  };
}
```

### How to pass modifiers when creating a component?

Any component modifier can be set externally when the component is created, just like a regular prop.

```
< b-example :theme = 'dark'
```

Or you can use the `mods` prop and pass in a dictionary with modifiers.

```
< b-example :mods = {theme: 'dark', visible: true}
```

This way is useful when you want to pass multiple modifiers at once, such as parent component modifiers.

```
< b-example :mods = mods
```

#### Automatically inherited modifiers

All V4Fire components have the `sharedMods` getter that returns a dictionary of modifiers that can be passed to any child components.
If you don't explicitly pass a `mods` prop when creating a component, then the `sharedMods` getter will automatically be passed to it.
This is very useful when the modifier needs to be propagated to all nested components. By default, the getter returns
a dictionary only with the `theme` modifier or undefined if it is not specified.

```
/// This
< b-example

/// Will equal to
< b-example :mods = sharedMods
```

To pass not only `sharedMods` but also your own via the `mods` prop, use the `provide.mods` method.

```
/// {theme: '...', visible: true}
< b-example :mods = provide.mods({visible: true})
```

To disable modifier inheritance, pass the `inheridMods: false` option when creating the component.

```typescript
import iBlock, { component } from 'super/i-block/i-block';

@component({inheritMods: false})
class bExample extends iBlock {}
```

### How to get component modifier value?

All active component modifiers are stored in the readonly `mods` property. Therefore, to get the value of any modifier,
just refer to the key you need. Please note that the key must be in a dash style, i.e. normalized.

```typescript
import iBlock, { component, ModsDecl } from 'super/i-block/i-block';

@component({inheritMods: false})
class bExample extends iBlock {
  static mods: ModsDecl = {
    theme: [
      'dark',
      ['light']
    ]
  };

  mounted() {
    console.log(this.mods.theme);
  }
}
```

This property can be observed using the watch API.

```typescript
import iBlock, { component, ModsDecl } from 'super/i-block/i-block';

@component({inheritMods: false})
class bExample extends iBlock {
  static mods: ModsDecl = {
    theme: [
      'dark',
      ['light']
    ]
  };

  mounted() {
    this.watch('mods.theme', (value, oldValue) => {
      console.log(value, oldValue);
    });
  }
}
```

Note that the `mods` field is created as a "system" field, i.e. no changes to its properties will cause the component to
be re-rendered. However, the associated CSS class will still be assigned to the component’s root element.
This is especially useful when we are working in the context of a functional component, which in principle
never updates its template after the first render.

```
/// Changing the `opened` modifier won't re-render the template
< template v-if = mods.opened === 'true'
  ...
```

If you want to use modifiers within a component template, then use the `m` getter.

```
/// Changing the `opened` modifier will re-render the template
< template v-if = m.opened === 'true'
  ...
```

### How to set a new component modifier value?

To set a new modifier value or remove an old one, you must use the `setMod` and `removeMod` methods.

```typescript
import iBlock, { component, ModsDecl } from 'super/i-block/i-block';

@component({inheritMods: false})
class bExample extends iBlock {
  static mods: ModsDecl = {
    theme: [
      'dark',
      ['light']
    ],

    opened: [true, false]
  };

  mounted() {
    this.$el.addEventListener('click', () => {
      this.setMod('opened', !this.mods.opened);
    });
  }
}
```

#### Modifier change events

Every time the value of any modifier changes, the component will emit a series of events that can be listened to both
inside and outside the component.

| EventName                 | Description                                                     | Payload description  | Payload       |
|---------------------------|-----------------------------------------------------------------|----------------------|---------------|
| `mod:set:$name`           | The modifier named $name has been set                           | Operation parameters | `SetModEvent` |
| `mod:set:$name:$value`    | The modifier named $name has been set to $value                 | Operation parameters | `SetModEvent` |
| `mod:remove:$name`        | The modifier under $name has been removed                       | Operation parameters | `ModEvent`    |
| `mod:remove:$name:$value` | The modifier named $name has been removed with the value $value | Operation parameters | `ModEvent`    |

```typescript
import iBlock, { component, ModsDecl } from 'super/i-block/i-block';

@component({inheritMods: false})
class bExample extends iBlock {
  static mods: ModsDecl = {
    theme: [
      'dark',
      ['light']
    ],

    opened: [true, false]
  };

  mounted() {
    this.$el.addEventListener('click', () => {
      this.setMod('opened', !this.mods.opened);
    });

    this.on('mod:set:opened', console.log);
  }
}
```

##### Local events

All setting or removing modifiers also fire local component events, i.e. which cannot be handled externally.
Since all the component local events can be listened to using the wildcard, this can be more convenient than handling each event individually.

| EventName                       | Description                                                             | Payload description  | Payload              |
|---------------------------------|-------------------------------------------------------------------------|----------------------|----------------------|
| `block.mod.set.$name.$value`    | The modifier named $name has been set to $value                         | Operation parameters | `SetModEvent`        |
| `el.mod.set.$name.$value`       | The element modifier named $name has been set to $value                 | Operation parameters | `SetModEvent`        |
| `block.mod.remove.$name.$value` | The modifier named $name has been removed with the value $value         | Operation parameters | `SetElementModEvent` |
| `el.mod.remove.$name.$value`    | The element modifier named $name has been removed with the value $value | Operation parameters | `ElementModEvent`    |

```typescript
import iBlock, { component, ModsDecl } from 'super/i-block/i-block';

@component({inheritMods: false})
class bExample extends iBlock {
  static mods: ModsDecl = {
    theme: [
      'dark',
      ['light']
    ],

    opened: [true, false]
  };

  mounted() {
    this.$el.addEventListener('click', () => {
      this.setMod('opened', !this.mods.opened);
    });

    this.localEmitter.on('block.mod.*.opened.*', console.log);
  }
}
```

### Element modifiers
