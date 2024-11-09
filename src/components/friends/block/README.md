# components/friends/block

This module provides an API to work with a component in terms of [BEM](https://en.bem.info/methodology/quick-start/).
This API includes all the necessary methods for working with block modifiers and element modifiers,
methods to find elements in the DOM tree, as well as various auxiliary methods. However, to work with block modifiers,
you should not use this API directly, but prefer more convenient wrappers that are in the context of the component.

## How to Include This Module in Your Component?

By default, any component that inherited from [[iBlock]] has the `block` property.
Some methods, such as `getFullBlockName`, `getMod`, `setMod`, `removeMod` are always available, and the rest must be
included explicitly to enable tree-shake code optimization.
Place the required import declaration within your component file.

```typescript
import iBlock, { component } from 'components/super/i-block/i-block';
import Block, { getElementMod, setElementMod } from 'components/friends/block';

// Import `getElementMod` and `setElementMod` methods
Block.addToPrototype({getElementMod, setElementMod});

@component()
export default class bExample extends iBlock {}
```

Note that the `block` property only appears on the component after the `mounted` hook.
To ensure that the given API was available when the method was called, use the `@wait` decorator.
Or use special wrapper methods.

```typescript
import iBlock, { component, wait } from 'components/super/i-block/i-block';
import Block, { getElementMod, setElementMod } from 'components/friends/block';

// Import `getElementMod` and `setElementMod` methods
Block.addToPrototype({getElementMod, setElementMod});

@component()
export default class bExample extends iBlock {
  @wait('loading') // Or @wait('ready')
  open(): CanPromise<void> {
    this.block.setMod('opened', true);
  }

  close() {
    // Using wrapper method
    this.setMod('opened', false);
  }
}
```

## Basic concepts

The BEM methodology describes how to apply the component-based approach to CSS when declaring a widget.
The methodology defines 3 basic entities: block, element and modifier.
Looking at it from a component UI programming perspective,
a block is the component root node, which has a special CSS class; elements are regular child nodes of a component that
have specially styled CSS classes; block modifiers are its inputs that have a contract that they also place
the necessary CSS classes.
In addition, elements can also have their own modifiers,
which are convenient to apply at the micro-level of component markup.

### How to declare component props as modifiers?

To declare modifiers for a component, you must use the `mods` static property.
Just pass it a dictionary where keys are modifier names and values are lists of them values.
Modifier values are always converted to a string.
However, when describing them, it is allowed to use numbers and boolean values.
Also, all modifier names and them values are forced to normalize to the dash style,
so you can use whatever style you feel comfortable with.
To assign any of the values as the default, just wrap it in another array.

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
And if you add new modifiers, then the parent modifiers will still be inherited.

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

All V4Fire components have the `sharedMods` getter that returns a dictionary of modifiers that can be
passed to any child components.
If you don't explicitly pass the `mods` prop when creating a component,
then the `sharedMods` getter will automatically be passed to it.
This is very useful when some modifiers need to be propagated to all nested components.
By default, the getter returns a dictionary only with the `theme` modifier or undefined if it is not specified.

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

All active component modifiers are stored in the readonly `mods` property.
Therefore, to get the value of any modifier, just refer to the key you need.
Please note that the key must be in a dash style, i.e., normalized.

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

Note that the `mods` field is created as a `system` field,
i.e., no changes to its properties will cause the component to be re-rendered.
However, the associated CSS class will still be assigned to the component root element.
This is especially useful when we are working in the context of a functional component,
which in principle never updates its template after the first render.

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

##### Local events

All setting/removing modifiers also fire local component events, i.e., which cannot be handled externally.
Since all the component local events can be listened to using wildcards,
this can be more convenient than handling each event individually.

| EventName                       | Description                                                             | Payload description  | Payload              |
|---------------------------------|-------------------------------------------------------------------------|----------------------|----------------------|
| `block.mod.set.$name.$value`    | The modifier named $name has been set to $value                         | Operation parameters | `SetModEvent`        |
| `el.mod.set.$name.$value`       | The element modifier named $name has been set to $value                 | Operation parameters | `SetModEvent`        |
| `block.mod.remove.$name.$value` | The modifier named $name has been removed with the value $value         | Operation parameters | `SetElementModEvent` |
| `el.mod.remove.$name.$value`    | The element modifier named $name has been removed with the value $value | Operation parameters | `ElementModEvent`    |

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

### Element modifiers

As mentioned earlier, any element can have its own modifiers.
From a component point of view, these modifiers are simply custom CSS classes for elements.
However, this module provides a set of methods for convenient work with them.

__b-example.ss__

```
- namespace [%fileName%]

- include 'components/super/i-block'|b as placeholder

- template index() extends ['i-block'].index
  - block body
    < .&__button

    < .&__dropdown.&_pos_bottom-left
      Hello world!
```

__b-example.ts__

```typescript
import iBlock, { component, ModsDecl } from 'components/super/i-block/i-block';

@component()
class bExample extends iBlock {
  mounted() {
    const
      {block: $b} = this;

    $b.element('button').addEventListener('click', () => {
      const dropdown = $b.element('dropdown');
      $b.setElementMod(dropdown, 'opened', $b.getElementMod(dropdown, 'dropdown', 'opened') !== 'true');
    })
  }
}
```

## Methods

### getFullBlockName

Returns the fully qualified block name of the associated component.
This method is plugged by default.

```js
this.componentName === 'b-example';

// 'b-example'
console.log(this.block.getFullBlockName());

// 'b-example_focused_true'
console.log(this.block.getFullBlockName('focused', true));
```

### getBlockSelector

Returns a CSS selector to the current component block.

```js
this.componentName === 'b-example';

// '.b-example'
console.log(this.block.getBlockSelector());

// '.b-example.b-example_focused_true'
console.log(this.block.getBlockSelector({focused: true}));
```

### getFullElementName

Returns the fully qualified name of the specified block element.

```js
this.componentName === 'b-example';

// 'b-example__foo'
console.log(this.block.getFullElementName('foo'));

// 'b-example__foo_focused_true'
console.log(this.block.getBlockSelector('foo', 'focused', true));
```

### getElementSelector

Returns a CSS selector to the specified block element.

```js
this.componentId === 'u123';
this.componentName === 'b-example';

// '.u123.b-example__foo'
console.log(this.block.getElementSelector('foo'));

// '.u123.b-example__foo.b-example__foo_focused_true'
console.log(this.block.getElementSelector('foo', {focused: true}));
```

### elements

Returns block child elements by the specified selector.

```js
console.log(this.block.elements(node, 'foo'));
console.log(this.block.elements(node, 'foo', {focused: true}));

console.log(this.block.elements('foo'));
console.log(this.block.elements('foo', {focused: true}));
```

### element

Returns a block child element by the specified selector.

```js
console.log(this.block.element(node, 'foo'));
console.log(this.block.element(node, 'foo', {focused: true}));

console.log(this.block.element('foo'));
console.log(this.block.element('foo', {focused: true}));
```

### getMod

Returns a value of the specified block modifier.
This method is plugged by default.

```js
console.log(this.block.getMod('focused'));
console.log(this.block.getMod('focused', true));
```

### setMod

Sets a block modifier to the current component.
The method returns false if the modifier is already set. This method is plugged by default.

```js
this.block.setMod('focused', true);
this.block.setMod('focused', true, 'removeMod');
```

### removeMod

Removes a block modifier from the current component.
The method returns false if the block does not have this modifier.

```js
this.block.removeMod('focused');
this.block.removeMod('focused', true);
this.block.removeMod('focused', true, 'setMod');
```

### getElementMod

Returns a modifier value from the specified element.

```js
this.block.getElementMod(element, 'foo', 'focused');
```

### setElementMod

Sets a modifier to the specified block element.
The method returns false if the modifier is already set.

```js
this.block.setElementMod(element, 'foo', 'focused', true);
this.block.setElementMod(element, 'foo', 'focused', true, 'initSetMod');
```

### removeElementMod

Removes a modifier from the specified block element.
The method returns false if the element does not have this modifier.

```js
this.block.removeElementMod(element, 'foo', 'focused');
this.block.removeElementMod(element, 'foo', 'focused', true);
this.block.removeElementMod(element, 'foo', 'focused', true, 'setMod');
```
