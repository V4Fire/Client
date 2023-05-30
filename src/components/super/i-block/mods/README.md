# components/super/i-block/mods

This module provides an API to work with a component in terms of [BEM](https://en.bem.info/methodology/quick-start/).
This module delegates the implementation to the [[Block]] friendly class.

## Basic concepts

The BEM methodology describes how to apply the component-based approach to CSS when declaring a widget.
The methodology defines 3 basic entities: block, element and modifier. Looking at it from a component UI programming perspective,
a block is the component root node, which have a special CSS class; elements are regular child nodes of a component that
have specially styled CSS classes; block modifiers are its inputs that have a contract that they also place the necessary CSS classes.
In addition, elements can also have their own modifiers, which are convenient to apply at the micro-level of component markup.

### How to declare component props as modifiers?

To declare modifiers for a component, you must use the `mods` static property. Just pass it a dictionary where keys are
modifier names and values are lists of them values. Modifier values are always converted to a string. However,
when describing them, it is allowed to use numbers and boolean values. Also, all modifier names and them values are
forced to normalize to the dash style, so you can use whatever style you feel comfortable with. To assign any of the values
as the default, just wrap it in another array.

```typescript
import iBlock, { component, ModsDecl } from 'components/super/i-block/i-block';

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
import iBlock, { component, ModsDecl } from 'components/super/i-block/i-block';

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
  // All `Parent` modifiers are inerited
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
import iBlock, { component, ModsDecl } from 'components/super/i-block/i-block';

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
import iBlock, { component, ModsDecl } from 'components/super/i-block/i-block';

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

Of course, you can combine both methods.

```
< b-example :theme = 'dark' | :mods = mods
```

#### Automatically inherited modifiers

All V4Fire components have the `sharedMods` getter that returns a dictionary of modifiers that can be passed to any child components.
If you don't explicitly pass the `mods` prop when creating a component, then the `sharedMods` getter will automatically be passed to it.
This is very useful when some modifiers need to be propagated to all nested components. By default, the getter returns
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

Or just pass modifiers as regular props.

```
/// {theme: '...', visible: true}
< b-example :visible = true
```

To disable modifier inheritance, pass the `inheridMods: false` option when creating the component.

```typescript
import iBlock, { component } from 'components/super/i-block/i-block';

@component({inheritMods: false})
class bExample extends iBlock {}
```

### How to get component modifier value?

All active component modifiers are stored in the readonly `mods` property. Therefore, to get the value of any modifier,
just refer to the key you need. Please note that the key must be in a dash style, i.e. normalized.

```typescript
import iBlock, { component, ModsDecl } from 'components/super/i-block/i-block';

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
import iBlock, { component, ModsDecl } from 'components/super/i-block/i-block';

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
be re-rendered. However, the associated CSS class will still be assigned to the component root element. This is especially
useful when we are working in the context of a functional component, which in principle never updates its template after the first render.

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
import iBlock, { component, ModsDecl } from 'components/super/i-block/i-block';

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

```typescript
import iBlock, { component, ModsDecl } from 'components/super/i-block/i-block';

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
      this.setMod('opened', this.mods.opened !== 'true');
    });

    this.on('mod:set:opened', console.log);
  }
}
```

##### Local events

All setting or removing modifiers also fire local component events, i.e. which cannot be handled externally.
Since all the component local events can be listened to using wildcards, this can be more convenient than handling each event individually.

| EventName                       | Description                                                             | Payload description  | Payload              |
|---------------------------------|-------------------------------------------------------------------------|----------------------|----------------------|
| `block.mod.set.$name.$value`    | The modifier named $name has been set to $value                         | Operation parameters | `SetModEvent`        |
| `el.mod.set.$name.$value`       | The element modifier named $name has been set to $value                 | Operation parameters | `SetModEvent`        |
| `block.mod.remove.$name.$value` | The modifier named $name has been removed with the value $value         | Operation parameters | `SetElementModEvent` |
| `el.mod.remove.$name.$value`    | The element modifier named $name has been removed with the value $value | Operation parameters | `ElementModEvent`    |

```typescript
import iBlock, { component, ModsDecl } from 'components/super/i-block/i-block';

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
      this.setMod('opened', this.mods.opened !== 'true');
    });

    this.localEmitter.on('block.mod.*.opened.*', console.log);
  }
}
```

## API

### Props

#### [modsProp]

Additional modifiers for the component.
Modifiers allow binding component state properties directly to CSS classes without unnecessary re-rendering of a component.

### Getters

#### mods

A dictionary with applied component modifiers.

#### sharedMods

The base component modifiers that can be shared with other components.
These modifiers are automatically provided to child components.

So, for example, you have a component that uses another component in your template, and you give the outer component some theme modifier.
This modifier will be recursively provided to all child components.

#### m

A special getter for component modifiers: the first time a property from this object is touched,
a modifier by property name will be registered, which can cause the component to re-render.
Don't use this getter outside the component template.

### Methods

#### setMod

Sets a component modifier by the specified name.

#### removeMod

Removes a component modifier by the specified name.

#### getRootMod

Returns a value of the specified root application element modifier.
The method uses the component `globalName` prop if it's provided. Otherwise, the `componentName` property.
Notice that the method returns a normalized value.

```typescript
import iBlock, { component } from 'components/super/i-block/i-block';

@component({inheritMods: false})
class bExample extends iBlock {
  mounted() {
    this.setRootMod('foo', 'blaBar');
    console.log(this.getRootMod('foo') === 'bla-bar');
  }
}
```

#### setRootMod

Sets a modifier to the root application element by the specified name.

This method is useful when you need to attach a class that can affect the entire application.
For example, you want to block page scrolling, meaning you need to add a class to the root HTML tag.

The method uses the component `globalName` prop if it's provided. Otherwise, the `componentName` property.

```typescript
import iBlock, { component } from 'components/super/i-block/i-block';

@component({inheritMods: false})
class bExample extends iBlock {
  mounted() {
    // this.componentName === 'b-button' && this.globalName === undefined
    this.setRootMod('foo', 'bla');
    console.log(document.documentElement.classList.contains('b-button-foo-bla'));

    // this.componentName === 'b-button' && this.globalName === 'bAz'
    this.setRootMod('foo', 'bla');
    console.log(document.documentElement.classList.contains('b-az-foo-bla'));
  }
}
```

#### removeRootMod

Removes a modifier from the root application element by the specified name.
The method uses the component `globalName` prop if it's provided. Otherwise, the `componentName` property.

```typescript
import iBlock, { component } from 'components/super/i-block/i-block';

@component({inheritMods: false})
class bExample extends iBlock {
  mounted() {
    this.setRootMod('foo', 'bla');
    console.log(document.documentElement.classList.contains('b-button-foo-bla'));

    this.removeRootMod('foo', 'baz');
    console.log(document.documentElement.classList.contains('b-az-foo-bla') === true);

    this.removeRootMod('foo');
    console.log(document.documentElement.classList.contains('b-az-foo-bla') === false);
  }
}
```
