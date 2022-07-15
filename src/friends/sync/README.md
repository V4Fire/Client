# friends/sync

This module provides an API to synchronize fields and props of a component.

## How to include this module to your component?

By default, any component that inherited from [[iBlock]] has the `sync` property.
Some methods, such as `link` and `mod` are always available, and the rest must be included explicitly to enable
tree-shake code optimization. Just place the necessary import declaration within your component file.

```typescript
import iBlock, { component } from 'super/i-block/i-block';
import Sync, { object, syncLinks } from 'friends/sync';

// Import `object` and `syncLinks` methods
Sync.addToPrototype(object, syncLinks);

@component()
export default class bExample extends iBlock {}
```

## Data link field

A link in V4 component terminology is a field that sets its value based on another field, prop, or event (hereinafter, the source).
As soon as the source of the link reports a change, such as a mutation in the observable property or emitting of the listened event,
the link will be synchronized with the source.

Links are very useful when we want to create a property based on a different source, but with a different data type.
For example, all component props cannot be changed from within the component. However, very often there is a need
to violate this rule. For example, we have a component that implements an input field. The component has some initial value,
as well as its own, which can be changed during the component life cycle, for instance, a user entered new text.
Technically, this can be done with two parameters: `initialValue` and `value`, which gets its initial value
from `initialValue`. Next, we need to set watching for the `initialValue` because if the component value changes outside,
then the internal value must also be updated.

One way to implement the above is to use the `watch` method and an initializer function for the field to be observed.
For instance:

```typescript
import iBlock, { component, prop, field } from 'super/i-block/i-block';

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

This code works, however, it has a number of disadvantages:

1. If the `initialValue` value needs to be normalized or converted somehow, then this logic will have to be duplicated in two places at once.

   ```typescript
   import iBlock, { component, prop, field } from 'super/i-block/i-block';

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
import iBlock, { component, prop, field } from 'super/i-block/i-block';

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
(you can specify a complex path, like `foo.bar.bla`), and the second parameter is a converter function.
And, the method itself returns the starting value of the watched property.

So, problems 1 and 2 are solved, but what about the third problem? We still have two properties, and they have different
names that we need to keep in mind. However, V4 has a simple convention: if a prop conflicts with a field or getter that
depends on it, then the `Prop` postfix is added to the prop name, i.e. in our case, this will be `valueProp`. If a similar
conflict occurs between a getter and a field, then `Store` postfix is added to the field name.

Moreover, V4 is aware of this convention, so when calling the component "outside" we can just write `:value`,
and V4 itself will substitute `:valueProp`. Also in this case, we get rid of the need to explicitly specify the name of
the watched property when calling `sync.link`. And finally, if we don’t need a converter function when linking a property,
then we can simply not write it. Let's rewrite our example again.

```typescript
import iBlock, { component, prop, field } from 'super/i-block/i-block';

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

## Methods

### link

Sets a link to a component/object property or event by the specified path.

Simply put, if field A refers to field B, then it has the same value and will automatically update when B changes.
If the link is set to an event, then every time this event fires, then the value of A will change to the value of
the event object. You can refer to a value as a whole or to a part of it. Just pass a special wrapper function
that will take parameters from the link and return the value to the original field.

To listen an event you need to use the special delimiter ":" within a path.
Also, you can specify an event emitter to listen by writing a link before ":".

#### Using `link` within a property decorator

```typescript
import watch from 'core/object/watch';
import iBlock, { component, prop, field } from 'super/i-block/i-block';

@component()
class bExample1 extends iBlock {
  @prop()
  fooProp: number = 0;

  @field((ctx) => ctx.sync.link())
  foo!: number;

  @field()
  blaStore: Dictionary = {a: {b: {c: 1}}};

  @field((ctx) => ctx.sync.link((val, oldVal?) => val.a.b.c))
  bla!: number;
}

@component()
class bExample2 extends iBlock {
  @prop()
  fooProp: Dictionary = {a: {b: {c: 1}}};

  @field((ctx) => ctx.sync.link({deep: true}, (val) => val + 1))
  foo!: number;
}

@component()
class bExample3 extends iBlock {
  @prop()
  foo: Dictionary = {a: {b: {c: 1}}};

  @field((ctx) => ctx.sync.link('foo.a.b.c'))
  bla!: number;

  @field((ctx) => ctx.sync.link({ctx: watch({bla: 1}).proxy, path: 'bla'}))
  bar!: number;

  @field((ctx) => ctx.sync.link('document:click', (e) => e.pageY))
  baz?: number;
}

@component()
class bExample4 extends iBlock {
  @prop()
  foo: Dictionary = {a: {b: 1}};

  @field((ctx) => ctx.sync.link('foo', {deep: true}, (value, oldValue?) => value.a.b + 1))
  bla!: number;

  @field((ctx) => ctx.sync.link({ctx: remoteObject, path: 'bla'}, {deep: true}, (value) => value + 1))
  bar!: number;

  @field((ctx) => ctx.sync.link('document:click', (e) => e.pageY))
  baz?: number;
}
```

#### Using `link` as a regular method

```typescript
import watch from 'core/object/watch';
import iBlock, { component, prop, field } from 'super/i-block/i-block';

@component()
class bExample1 extends iBlock {
  @prop()
  foo: Dictionary = {a: {b: {c: 1}}};

  @field()
  bla!: number;

  @field()
  bar!: number;

  @field()
  baz?: number;

  created() {
    this.bla = this.sync.link(['bla', 'foo.a.b.c']);
    this.bar = this.sync.link(['bar', {ctx: watch({bla: 1}).proxy, path: 'bla'}]);
    this.baz = this.sync.link(['baz', 'document:click'], (e) => e.pageY);
  }
}

@component()
class bExample2 extends iBlock {
  @prop()
  foo: Dictionary = {a: {b: 1}};

  @field()
  bla!: number;

  @field()
  bar!: number;

  @field()
  baz?: number;

  created() {
    this.bla = this.sync.link(['bla', 'foo'], {deep: true}, (value, oldValue?) => value.a.b + 1);
    this.bar = this.sync.link(['bar', watch({bla: 1}).proxy], {deep: true}, (value, oldValue?) => value.bla + 1);
    this.baz = this.sync.link(['baz', 'document:click'], (e) => e.pageY);
  }
}
```

### object

Creates a dictionary where all keys refer to other properties/events as links.

Simply put, if field A refers to field B, then it has the same value and will automatically update when B changes.
If the link is set to an event, then every time this event fires, then the value of A will change to the value of
the event object. You can refer to a value as a whole or to a part of it. Just pass a special wrapper function
that will take parameters from the link and return the value to the original field.

To listen an event you need to use the special delimiter ":" within a path.
Also, you can specify an event emitter to listen by writing a link before ":".

```typescript
import watch from 'core/object/watch';
import iBlock, { component, prop, field } from 'super/i-block/i-block';

@component()
class bExample1 extends iBlock {
  @field()
  foo: Dictionary = 0;

  @field()
  bla: Dictionary = {a: {b: 1}};

  @field()
  bar: number = 0;

  @field((ctx) => ctx.sync.object([
    'foo',
    ['blaAlias', 'bla.a.b'],
    ['bar', String],
    ['baz', 'document:click', (e) => e.pageY]
  ]))

  baz!: {foo: number; blaAlias: number; bar: string; baz: number};
}

@component()
class bExample2 extends iBlock {
  @field()
  foo: Dictionary = 0;

  @field()
  bla: Dictionary = {a: {b: 1}};

  @field()
  bar: number = 0;

  @field((ctx) => ctx.sync.object({deep: true}, [
    'foo',
    ['blaAlias', (value, oldValue?) => value.a.b],
    ['bar', String],
    ['baz', 'document:click', (e) => e.pageY]
  ]))

  baz!: {foo: number; blaAlias: number; bar: string; baz: number};
}

@component()
class bExample3 extends iBlock {
  @field()
  foo: Dictionary = 0;

  @field()
  bla: Dictionary = {a: {b: 1}};

  @field()
  bar: number = 0;

  @field((ctx) => ctx.sync.object('links', [
    'foo',
    ['blaAlias', 'bla.a.b'],
    ['bar', String],
    ['baz', 'document:click', (e) => e.pageY]
  ]))

  baz: {links: {foo: number; blaAlias: number; bar: string; baz: number}}
}
```

### mod

Binds a modifier to a property by the specified path.

```typescript
this.sync.mod('opened', 'visible', Boolean);
```
