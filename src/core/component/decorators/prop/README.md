# core/component/decorators/prop

The decorator marks a class property as a component input property (aka "prop").

```typescript
import iBlock, { component, prop } from 'super/i-block/i-block';

@component()
class bExample extends iBlock {
  // The decorator can be called either without parameters
  @prop()
  foo: number = 0;

  // Or by passing a constructor function of the prop
  @prop(Number)
  bla: number = 0;

  // Or a dictionary with additional options
  @prop({type: Number, default: Math.random})
  bar!: number;

  // If the prop can be of different types, then pass an array of constructors
  @prop({type: [Number, String], required: false})
  baz?: number | string;
}
```

## Additional options

### [type]

A constructor function of the prop type.
If the prop can be of different types, then you need to specify a list of constructors.

```typescript
import iBlock, { component, prop } from 'super/i-block/i-block';

@component()
class bExample extends iBlock {
  @prop({type: Number})
  bla!: number;

  @prop({type: [Number, String]})
  baz!: number | string;
}
```

### [required = `true`]

By default, all component props must be value-initialized.
The values are either passed explicitly when a component is called, or are taken from the default values.
If you set the `required` option to false, then the prop can be non-initialized.

```typescript
import iBlock, { component, prop } from 'super/i-block/i-block';

@component()
class bExample extends iBlock {
  @prop({required: false})
  bla?: number;

  @prop()
  baz: number = 0;
}
```

### [default]

This option allows you to set the default value of the prop.
But using it, as a rule, is not explicitly required, since the default value can be passed through the native syntax of
class properties.

```typescript
import iBlock, { component, prop } from 'super/i-block/i-block';

@component()
class bExample extends iBlock {
  // There will be a trouble here when cloning the value
  @prop(Element)
  body: Element = document.body;

  // All fine
  @prop(() => document.body)
  validBody!: Element;
}
```

Note that if the default value is set using class property syntax, then it is a prototype, not a real value.
That is, when set to each new instance, it will be cloned using `Object.fastClone`.
If this behavior does not suit you, then pass the value explicitly via `default`.

```typescript
import iBlock, { component, prop } from 'super/i-block/i-block';

@component()
class bExample extends iBlock {
  // There will be a trouble here when cloning the value
  @field()
  body: Element = document.body;

  // All fine
  @prop({default: document.body})
  validBody!: Element;
}
```

Also, you can pass the default value as a function. It will be called, and its result will become the default value.
Note that if your prop type is `Function`, then the default value will be treated "as is".

```typescript
import iBlock, { component, prop } from 'super/i-block/i-block';

@component()
class bExample extends iBlock {
  @prop({default: Math.random})
  hashCode!: number;
}
```

### [validator]

A function to check the passed value for compliance with the requirements.
Use it if you want to impose additional checks besides checking the prop type.

```typescript
import iBlock, { component, prop } from 'super/i-block/i-block';

@component()
class bExample extends iBlock {
  @prop({type: Number, validator: Number.isPositive})
  bla!: number;
}
```

### [watch]

A watcher or a list of watchers for the current prop.
The watcher can be defined as a component method to invoke, callback function, or watch handle.

The `core/watch` module is used to make objects watchable.
Therefore, for more information, please refer to its documentation.

```typescript
import iBlock, { component, prop } from 'super/i-block/i-block';

@component()
class bExample extends iBlock {
  @prop({watch: [
    'onIncrement',

    (ctx, val, oldVal, info) =>
      console.log(val, oldVal, info),

    // Also, see core/object/watch
    {
      // If false, then a handler that is invoked on the watcher event does not take any arguments from the event
      provideArgs: false,

      // How the event handler should be called:
      //
      // 1. `'post'` - the handler will be called on the next tick after the mutation and
      //    guaranteed after updating all tied templates;
      //
      // 2. `'pre'` - the handler will be called on the next tick after the mutation and
      //    guaranteed before updating all tied templates;
      //
      // 3. `'sync'` - the handler will be invoked immediately after each mutation.
      flush: 'sync',

      // Can define as a function too
      handler: 'onIncrement'
    }
  ]})

  i: number = 0;

  onIncrement(val, oldVal, info) {
    console.log(val, oldVal, info);
  }
}
```

### [functional = `true`]

If false, the prop can't be passed to a functional component.

### [forceDefault = `false`]

If true, the prop always uses its own default value when needed. In fact, this option is used when the `defaultProps`
property is set to false on the class being described, and we want to cancel this behaviour for a particular prop.
