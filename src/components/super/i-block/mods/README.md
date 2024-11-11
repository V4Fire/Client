# components/super/i-block/mods

This module provides an API
for working with components using the [BEM](https://en.bem.info/methodology/quick-start/) methodology.
The implementation is delegated to the [[Block]] friendly class.

## Basic Concepts

The BEM methodology describes how to apply a component-based approach to CSS when defining a widget.
The methodology defines three main entities: block, element, and modifier.
From the perspective of component-based UI programming, the block is the root node of the component,
having a special CSS class; elements are regular child nodes of the component, having specifically styled CSS classes;
block modifiers are its inputs, which also have a convention for adding necessary CSS classes.
Additionally, elements can also have their own modifiers,
which are conveniently applied at a micro level in the component's markup.

### Declaring Component Props as Modifiers

To declare modifiers for a component, you need to use the static property `mods`.
Pass it a dictionary where the keys are the modifier names and the values are lists representing their values.
The modifier values are always converted to strings.
However, when describing them, you can use numbers and boolean values.
Additionally, all modifier names and values are forcibly normalized to kebab case,
so you can use any style that suits you.
To assign any of the default values, wrap it in another array.

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

When one component inherits from another, its modifiers are also inherited.
And if you add new modifiers, the parent modifiers will still be inherited.

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

It is allowed to access the values of a modifier that are inherited from the parent component.

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

### How to Pass Modifiers When Creating a Component?

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

#### Automatically Inherited Modifiers

All V4Fire components have a getter called `sharedMods`,
which returns a dictionary of modifiers that can be passed to any child components.
If you don't explicitly pass the `mods` prop when creating a component,
the `sharedMods` getter will be automatically passed to it.
This is handy when you need to propagate certain modifiers to all nested components.
By default, the getter returns a dictionary with only the `theme` modifier or undefined if it's not specified.

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

@component()
class bExample extends iBlock {}
```

### Getting a Component's Modifier Value

All component's applied modifiers are stored in the `mods` read-only property.
Therefore, to get the value of any modifier, simply access the desired key.
Note that the key should be in kebab case, i.e., normalized.

```typescript
import iBlock, { component, ModsDecl } from 'components/super/i-block/i-block';

@component()
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

@component()
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

Please note that the `mods` field is created as "system",
meaning that any changes to its properties will not cause the component to be re-rendered.
However, the associated CSS class will still be assigned to the root element of the component.
This is especially useful when working in the context of a functional component that,
in principle, never updates its template after the initial render.

```
/// Changing the `opened` modifier won't cause the template to be re-rendered
< template v-if = mods.opened === 'true'
  ...
```

If you want to use modifiers within a component template, then use the `m` getter.

```
/// Changing the `opened` modifier will cause the template to be re-rendered
< template v-if = m.opened === 'true'
  ...
```

### Setting a New Component's Modifier Value

To set a new modifier value or remove an existing one, you can use the `setMod` and `removeMod` methods.

```typescript
import iBlock, { component, ModsDecl } from 'components/super/i-block/i-block';

@component()
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

#### Modifier Change Events

Whenever the value of any modifier changes,
the component will emit a series of events that can be listened to both inside and outside the component.
These events provide a way to react to changes in modifiers and perform any necessary actions or updates.

| EventName                 | Description                                                     | Payload description      | Payload       |
|---------------------------|-----------------------------------------------------------------|--------------------------|---------------|
| `mod:set:$name`           | The modifier named $name has been set                           | The operation parameters | `SetModEvent` |
| `mod:set:$name:$value`    | The modifier named $name has been set to $value                 | The operation parameters | `SetModEvent` |
| `mod:remove:$name`        | The modifier under $name has been removed                       | The operation parameters | `ModEvent`    |

```typescript
import iBlock, { component, ModsDecl } from 'components/super/i-block/i-block';

@component()
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

##### Local Events

All set and remove operations for modifiers also trigger local component events that cannot be handled from the outside.
Since all local component events can be listened to using placeholders,
it can be more convenient than handling each event separately.

| EventName                       | Description                                                             | Payload description      | Payload              |
|---------------------------------|-------------------------------------------------------------------------|--------------------------|----------------------|
| `block.mod.set.$name.$value`    | The modifier named $name has been set to $value                         | The operation parameters | `SetModEvent`        |
| `el.mod.set.$name.$value`       | The element modifier named $name has been set to $value                 | The operation parameters | `SetModEvent`        |
| `block.mod.remove.$name.$value` | The modifier named $name has been removed with the value $value         | The operation parameters | `SetElementModEvent` |
| `el.mod.remove.$name.$value`    | The element modifier named $name has been removed with the value $value | The operation parameters | `ElementModEvent`    |

```typescript
import iBlock, { component, ModsDecl } from 'components/super/i-block/i-block';

@component()
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
Modifiers allow binding the state properties of a component directly to CSS classes,
without the need for unnecessary re-rendering.

### Getters

#### mods

A dictionary containing applied component modifiers.

#### sharedMods

The base component modifiers that can be shared with other components.
These modifiers are automatically provided to child components.

So, for example, you have a component that uses another component in your template,
and you give the outer component some theme modifier.
This modifier will be recursively provided to all child components.

#### m

A special getter for applied modifiers.
When accessing any modifier using this getter,
a reactive binding will be created between its value and the template.

It is not recommended to use this getter outside the component's template,
as it may lead to unexpected behavior or unnecessary re-renders.

### Methods

#### setMod

Sets a component modifier by the specified name.

#### removeMod

Removes a component modifier by the specified name.

#### getRootMod

Returns the value of the specified modifier for the root element of the application.
The method uses the component's `globalName` prop if provided, otherwise it uses the `componentName` property.
Note that the method returns the normalized value of the modifier.

```typescript
import iBlock, { component } from 'components/super/i-block/i-block';

@component()
class bExample extends iBlock {
  mounted() {
    this.setRootMod('foo', 'blaBar');
    console.log(this.getRootMod('foo') === 'bla-bar');
  }
}
```

#### setRootMod

Sets a modifier for the root element of the application based on the specified name.

This method is useful when you need to attach a class that can affect the entire application.
For example, if you want to disable page scrolling, you would need to add a class to the root HTML element.

The method uses the component's `globalName` prop if provided, otherwise it uses the `componentName` property.

```typescript
import iBlock, { component } from 'components/super/i-block/i-block';

@component()
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

Removes a modifier from the root element of the application based on the specified name.
The method uses the component `globalName` prop if it's provided. Otherwise, the `componentName` property.

```typescript
import iBlock, { component } from 'components/super/i-block/i-block';

@component()
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
