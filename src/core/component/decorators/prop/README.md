# core/component/decorators/prop

The decorator marks a class property as a component input property (aka "prop").

```typescript
import iBlock, { component, prop } from 'components/super/i-block/i-block';

@component()
class bExample extends iBlock {
  // The decorator can be called either without parameters
  @prop()
  value1: number = 0;

  // Or by passing a constructor function of the prop
  @prop(Number)
  value2: number = 0;

  // Or a dictionary with additional options
  @prop({type: Number, default: Math.random})
  value3!: number;

  // If the prop can be of different types, then pass an array of constructors
  @prop({type: [Number, String], required: false})
  value4?: number | string;
}
```

Keep in mind that any component prop is a readonly value, i.e.,
you cannot change it or any of its properties from within the component.
To emphasize this, it is recommended to use the readonly modifier in TypeScript along with prop declarations.

```typescript
import iBlock, { component, prop } from 'components/super/i-block/i-block';

@component()
class bExample extends iBlock {
  @prop(Number)
  readonly value: number = 0;
}
```

## Naming conventions and linking fields with props

As mentioned earlier, component props cannot be changed from within the component.
However, very often there is a need to violate this rule.
For example, we have a component that implements an input field.
The component has some initial value, as well as its own, which can be changed during the component life cycle.
For instance, a user entered a new text.
Technically, this can be done with two parameters: `initialValue` and `value`, which gets its initial value
from `initialValue`.
Next, we need to set watching for the `initialValue` because if the component value changes outside,
then the internal value must also be updated.

One way to implement the above is to use the `watch` method and an initializer function for the field to be observed.
For instance:

```typescript
import iBlock, { component, prop, field } from 'components/super/i-block/i-block';

@component()
export default class bInput extends iBlock {
  @prop(String)
  initialValue: string = '';

  @field((o) => {
    o.watch('initialValue', (v) => o.value = v);
    return o.initialValue;
  })

  value!: string;
}
```

This code works. However, it has a number of disadvantages:

1. If the `initialValue` value needs to be normalized or converted somehow,
   then this logic will have to be duplicated in two places at once.

   ```typescript
   import iBlock, { component, prop, field } from 'components/super/i-block/i-block';

   @component()
   export default class bInput extends iBlock {
     @prop(String)
     initialValue: string = '';

     @field((o) => {
       o.watch('initialValue', (v) => o.value = Date.parse(v));
       return Date.parse(o.initialValue);
     })

     value!: Date;
   }
   ```

2. You must explicitly set the field value `((v) => o.value = v)` when setting up the watch function.
3. Redundant component API: outside we pass the `initialValue`, and inside we use the `value`.

To solve these problems, V4 has a special `sync.link` method, which, in fact, does the mechanism described above,
but hides it "under the hood". Let's rewrite our example using `sync.link`.

```typescript
import iBlock, { component, prop, field } from 'components/super/i-block/i-block';

@component()
export default class bInput extends iBlock {
  @prop(String)
  initialValue: string = '';

  @field({
    type: String,
    init: (o) => o.sync.link('initialValue', (v) => v)
  })

  value!: string;
}
```

As you can see, the method takes a string with the watchable property as the first parameter
(you can specify a complex path, like `foo.bar.bla`), and the second parameter is a getter function.
And, the method itself returns the starting value of the watched property.

So, problems 1 and 2 are solved, but what about the third problem?
We still have two properties, and they have different names that we need to keep in mind.
However, V4 has a simple convention: if a prop conflicts with a field or getter that
depends on it, then the `Prop` postfix is added to the prop name, i.e., in our case, this will be `valueProp`.
If a similar conflict occurs between a getter and a field, then `Store` postfix is added to the field name.

Moreover, V4 is aware of this convention, so when calling the component "outside" we can just write `:value`,
and V4 itself will substitute `:valueProp`.
Also in this case, we get rid of the need to explicitly specify the name of
the watched property when calling `sync.link`.
And finally, if we don’t need a converter function when linking a property, then we can simply not write it.
Let's rewrite our example again.

```typescript
import iBlock, { component, prop, field } from 'components/super/i-block/i-block';

@component()
export default class bInput extends iBlock {
  @prop(String)
  valueProp: string = '';

  @field((o) => o.sync.link())
  value!: string;
}
```

And calling our component from another template will be like this.

```
< b-input :value = 'V4 is awesome!'
```

As you can see, we got rid of unnecessary boilerplate code and the need to remember the name of the component prop.

## Additional options

### [type]

A constructor function of the prop type.
If the prop can be of different types, then you need to specify a list of constructors.

```typescript
import iBlock, { component, prop } from 'components/super/i-block/i-block';

@component()
class bExample extends iBlock {
  @prop({type: Number})
  value1!: number;

  @prop({type: [Number, String]})
  value2!: number | string;
}
```

### [required = `true`]

By default, all component props must be value-initialized.
The values are either passed explicitly when a component is called, or are taken from the default values.
If you set the `required` option to false, then the prop can be non-initialized.

```typescript
import iBlock, { component, prop } from 'components/super/i-block/i-block';

@component()
class bExample extends iBlock {
  @prop({required: false})
  value1?: number;

  @prop()
  value2: number = 0;
}
```

### [default]

This option allows you to set the default value of the prop.
But using it, as a rule, is not explicitly required, since the default value can be passed through the native syntax of
class properties.

```typescript
import iBlock, { component, prop } from 'components/super/i-block/i-block';

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
import iBlock, { component, prop } from 'components/super/i-block/i-block';

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
import iBlock, { component, prop } from 'components/super/i-block/i-block';

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
import iBlock, { component, prop } from 'components/super/i-block/i-block';

@component()
class bExample extends iBlock {
  @prop({type: Number, validator: Number.isPositive})
  value!: number;
}
```

### [forceUpdate = `true`]

If set to false, changing the prop will never trigger a re-render of the component template.
Use this mode for props that are not used in the template to reduce the number of unwanted re-renders.

```typescript
import iBlock, { component, prop } from 'components/super/i-block/i-block';

@component()
class bExample extends iBlock {
  @prop({type: Number, forceUpdate: false})
  value!: number;
}
```

### [watch]

A watcher or a list of watchers for the current prop.
The watcher can be defined as a component method to invoke, callback function, or watch handle.

The `core/watch` module is used to make objects watchable.
Therefore, for more information, please refer to its documentation.

```typescript
import iBlock, { component, prop } from 'components/super/i-block/i-block';

@component()
class bExample extends iBlock {
  @prop({watch: [
    'onIncrement',

    (ctx, val, oldVal, info) =>
      console.log(val, oldVal, info),

    // Also, see core/object/watch
    {
      // If set to false, then a handler that is invoked on the watcher event does not take any arguments from the event
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

If set to false, the prop can't be passed to a functional component.

### [forceDefault = `false`]

If set to true, the prop always uses its own default value when needed.
This option is actually used when the `defaultProps` property is set to false for the described component
(via the `@component` decorator) and we want to override this behavior for a particular prop.
