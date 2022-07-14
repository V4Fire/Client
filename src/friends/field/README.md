# friends/field

This module provides a class with helper methods for safely accessing component/object properties.
That is, you can use a complex property path without fear of exceptions if the property does not exist.

```js
this.field.set('foo.bla.bar', 1);
this.field.get('foo.bla.bar');
this.field.delete('foo.bla.bar');

// Each method can take an object to search

this.field.set('foo.bla.bar', 1, this.r);
this.field.get('foo.bla.bar', this.r);
this.field.delete('foo.bla.bar', this.r);
```

## How to include this module to your component?

By default, any component that inherited from [[iBlock]] has the `field` property.
Some methods, such as `get` and `set` are always available, and the rest must be
included explicitly to enable tree-shake code optimization. Just place the necessary import declaration within your component file.

```typescript
import iBlock, { component } from 'super/i-block/i-block';
import Field, { deleteField } from 'friends/field';

// Import the `delete` method
Field.addToPrototype({delete: deleteField});

@component()
export default class bExample extends iBlock {}
```

## Why not to use `Object.set/get/delete`?

There are three reasons to use `Field` instead of Prelude methods.

1. Prelude methods are not aware of the component watchable properties, such as system or regular fields.
   That is, if you use accessor-based watching, you run the risk of falling into the trap where the property cannot
   be watched because it was never defined. Let's look at an example below.

   ```typescript
   import iBlock, { component, prop, field } from 'super/i-block/i-block';

   @component()
   export default class bExample extends iBlock {
     @field()
     myData: Dictionary = {};

     mounted() {
       this.watch('myData.foo', {flush: 'sync', collapse: false}, (val) => {
         console.log(val);
       });

       // These mutations will be ignored when using watching based on assessors due to technical restrictions
       // because the property was never defined before
       this.myData.foo = 1;
       Object.set(this, 'myData.foo', 2);

       // This mutation will be catched
       this.field.set('myData.foo', 3);

       // This mutation is unobservable and removes all observables from the property.
       // To restore the view, use `field.set` again.
       delete this.myData.foo;

       // Or prefer this
       this.field.delete('myData.foo');
     }
   }
   ```

2. Prelude methods are unaware of component states and hooks. For example, before the component switches to the "created" hook,
   we cannot directly set the field values, because all fields are initialized when "created". In this case,
   the `Field` class can optionally set the value to the internal store.

   ```typescript
   import iBlock, { component, prop, field } from 'super/i-block/i-block';

   @component()
   export default class bExample extends iBlock {
     @field()
     myData1!: Dictionary;

     @field()
     myData2!: Dictionary;

     beforeCreate() {
       // We can't set the field value directly because the component hasn't switched to `created` yet
       this.myData1 = {foo: 1};

       // But we can use `field.set`
       this.field.set('myData2.foo', 2);

       // The field value is not initialized yet,
       // so when we check it we get `undefined`
       console.log(this.myData2 === undefined);

       // `field.get` takes the field value from the internal store
       console.log(this.field.get('myData2.foo') === 2);
     }

     mounted() {
       console.log(this.myData1 === undefined);
       console.log(this.myData2.foo === 2);
     }
   }
   ```

3. The `field` methods have additional overloads to provide a function that returns a property value or a key.

   ```typescript
   import iBlock, { component, prop, field } from 'super/i-block/i-block';

   @component()
   export default class bExample extends iBlock {
     @field()
     myData: Dictionary = {foo_bla: {baz_bar: 1}};

     mounted() {
       // 1
       console.log(this.field.get('fooBla.bazBar', (prop, obj) => obj[prop.underscore()]));

       this.field.set('fooBla.bazBar', 2, String.underscore);
       this.field.delete('fooBla.bazBar', String.underscore);
     }
   }
   ```

## Methods

### get

Returns a property by the specified path.

```typescript
import iBlock, { component, field } from 'super/i-block/i-block';

@component()
export default class bInput extends iBlock {
  @field()
  foo: Dictionary = {
    bla: 1,
    bla_bar: 2
  };

  created() {
    // 1
    console.log(this.field.get('foo.bla'));

    // 2
    console.log(this.field.get('foo.blaBar', (prop, obj) => Object.get(obj, prop.underscore())));

    // 1
    console.log(this.field.get('foo.bla', {foo: {bla: 1}}));

    // 2
    console.log(this.field.get('foo.blaBar', {foo: {bla_bar: 2}}, (prop, obj) => Object.get(obj, prop.underscore())));
  }
}
```

### set

Sets a new property by the specified path.

```typescript
import iBlock, { component, field } from 'super/i-block/i-block';

@component()
export default class bInput extends iBlock {
  @field()
  foo: Dictionary = {};

  created() {
    this.field.set('foo.bla', 1);
    console.log(this.foo.bla === 1);

    this.field.set('foo.blaBar', 2, String.underscore);
    console.log(this.foo.bla_bar === 2);

    const obj = {};

    this.field.set('foo.bla', obj, 1);
    console.log(obj.foo.bla === 1);

    this.field.set('foo.blaBar', obj, 2, String.underscore);
    console.log(obj.foo.bla_bar === 2);
  }
}
```

### delete

Deletes a property by the specified path.

```typescript
import iBlock, { component, field } from 'super/i-block/i-block';

@component()
export default class bInput extends iBlock {
  @field()
  foo: Dictionary = {
    bla: 1,
    bla_bar: 2
  };

  created() {
    this.field.delete('foo.bla');
    console.log('bla' in this.foo === false);

    this.field.delete('foo.blaBar', String.underscore);
    console.log('bla_bar' in this.foo === false);

    const obj = {
      bla: 1,
      bla_bar: 2
    };

    this.field.delete('foo.bla', obj);
    console.log('bla' in obj.foo === false);

    this.field.delete('foo.blaBar', obj, String.underscore);
    console.log('bla_bar' in obj.foo === false);
  }
}
```
