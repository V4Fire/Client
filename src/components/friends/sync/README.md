# components/friends/sync

This module provides an API to synchronize fields and props of a component.

## How to include this module to your component?

By default, any component that inherits from [[iBlock]] has the `sync` property. Certain methods, like `link` and `mod`, are available by default, while others need to be explicitly included to facilitate tree-shaking code optimization. To do this, simply add the required import declaration within your component file.

```typescript
import iBlock, { component } from 'components/super/i-block/i-block';
import Sync, { object, syncLinks } from 'components/friends/sync';

// Import `object` and `syncLinks` methods
Sync.addToPrototype({object, syncLinks});

@component()
export default class bExample extends iBlock {}
```

## Data link field

In V4 component terminology, a link refers to a field that determines its value based on another field, prop, or event (collectively referred to as the source).

As soon as the source of the link reports a change, such as a mutation in the observable property or the emission of a listened event, the link synchronizes with the source.

Links are highly useful when we want to create a property based on a different source but with a distinct data type. For instance, all component props cannot be changed from within the component. However, there is often a need to circumvent this rule.

For example, consider a component that implements an input field. The component possesses an initial value, as well as its own value, which can be altered during the component life cycle, such as when a user enters new text.

Technically, this can be executed with two parameters: `initialValue` and `value`, with the latter receiving its initial value from `initialValue`. Subsequently, we need to establish a watch for the `initialValue` because if the component value changes externally, the internal value must also be updated.

One way to implement the above scenario is to use the `watch` method and an initializer function for the observed field.
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

This code works; however, it has several disadvantages:

1. If the `initialValue` needs to be normalized or converted somehow, then this logic will have to be duplicated in two places.

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

2. You must explicitly set the field value `((v) => o.value = v)` when configuring the watch function.
3. Redundant component API: externally, we pass the `initialValue`, and internally, we use the `value`.

To address these issues, V4 provides a special `sync.link` method, which essentially performs the mechanism described above but conceals it "under the hood". Let's re-write our example using `sync.link`.

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

As you can see, the method takes a string with the watchable property as the first parameter (you can specify a complex path, like `foo.bar.bla`), and the second parameter is a getter function. The method itself returns the initial value of the watched property.

Thus, problems 1 and 2 are resolved, but what about the third issue? We still have two properties with different names that we need to remember. However, V4 has a simple convention: if a prop conflicts with a field or getter that depends on it, then the `Prop` postfix is added to the prop name, i.e., in our case, this will be `valueProp`. If a similar conflict occurs between a getter and a field, then the `Store` postfix is added to the field name.

Moreover, V4 recognizes this convention, so when invoking the component "externally", we can simply write `:value`, and V4 itself will substitute `:valueProp`. In this case, we also eliminate the need to explicitly specify the name of the watched property when calling `sync.link`. Finally, if we don’t require a converter function when linking a property, we can just omit it. Let's re-write our example once more.

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

When calling our component from another template, it will be like this:

```
< b-input :value = 'V4 is awesome!'
```

As you can see, we have eliminated unnecessary boilerplate code and the need to remember the name of the component prop.

## Methods

### link

Sets a link to a component/object property or event by the specified path.
This method is plugged by default.

Simply put, if field A refers to field B, then it has the same value and will automatically update when B changes.
If the link is set to an event, then every time this event fires, then the value of A will change to the value of
the event object. You can refer to a value as a whole or to a part of it. Just pass a special getter function
that will take parameters from the link and return the value to the original field.

To listen an event you need to use the special delimiter ":" within a path.
Also, you can specify an event emitter to listen by writing a link before ":".

#### Using `link` within a property decorator

```typescript
import watch from 'core/object/watch';
import iBlock, { component, prop, field } from 'components/super/i-block/i-block';

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
import iBlock, { component, prop, field } from 'components/super/i-block/i-block';

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
the event object. You can refer to a value as a whole or to a part of it. Just pass a special getter function
that will take parameters from the link and return the value to the original field.

To listen an event you need to use the special delimiter ":" within a path.
Also, you can specify an event emitter to listen by writing a link before ":".

```typescript
import watch from 'core/object/watch';
import iBlock, { component, prop, field } from 'components/super/i-block/i-block';

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
This method is plugged by default.

```typescript
import iBlock, { component, prop } from 'components/super/i-block/i-block';

@component()
class bExample extends iBlock {
  @prop(Object)
  params: Dictionary = {
    opened: true,
    visible: true
  };

  protected override initModEvents(): void {
    // Each time the `params.opened` prop changes, the `opened` modifier will also change
    this.sync.mod('opened', 'params.opened');

    // Each time the `params` prop changes, the `visible` modifier will also change
    this.sync.mod('visible', 'params', {deep: true}, ({visible}) => Boolean(visible));
  }
}
```

### syncLinks

Synchronizes component reference values with the values they are linked with.

```typescript
import iBlock, { component } from 'components/super/i-block/i-block';
import Sync, { object, syncLinks } from 'components/friends/sync';

Sync.addToPrototype({syncLinks});

@component()
export default class bInput extends iBlock {
  @prop(String)
  valueProp: string = '';

  @field((o) => o.sync.link())
  value!: string;

  created() {
    // Synchronize all existing links with their values
    this.sync.syncLinks();

    // Synchronize all links to `valueProp`
    this.sync.syncLinks('valueProp');

    // Synchronize all links to `valueProp` and set all values to `'foo'`
    this.sync.syncLinks('valueProp', 'foo');

    console.log(this.value === 'foo');
  }
}
```
