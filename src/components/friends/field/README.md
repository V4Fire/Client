# components/friends/field

This module provides a class which includes helper methods for safely accessing component/object properties.
This enables usage of complex property paths without the risk of encountering exceptions if the property does not exist.

```js
this.field.set('foo.bla.bar', 1);
this.field.get('foo.bla.bar');
this.field.delete('foo.bla.bar');

// Each method can take an object to search

this.field.set('foo.bla.bar', 1, this.r);
this.field.get('foo.bla.bar', this.r);
this.field.delete('foo.bla.bar', this.r);
```

## How to Include this Module in Your Component?

By default, any component that inherits from [[iBlock]] has the `field` property.
Some methods, such as `get` and `set`, are always available,
while others need to be explicitly included to enable tree-shaking code optimization.
To do this, simply add the necessary import declaration within your component file.

```typescript
import iBlock, { component } from 'components/super/i-block/i-block';
import Field, { deleteField } from 'components/friends/field';

// Import the `delete` method
Field.addToPrototype({delete: deleteField});

@component()
export default class bExample extends iBlock {}
```

## Why Not Use `Object.set/get/delete`?

There are three reasons to use `Field` instead of Prelude methods.

1. Prelude methods are not aware of the component's watchable properties, such as a system or regular fields.
   This means that if you use accessor-based watching,
   you might face the risk of failing to watch a property because it was never defined.
   Let's look at an example below.

   ```typescript
   import iBlock, { component, prop, field } from 'components/super/i-block/i-block';

   @component()
   export default class bExample extends iBlock {
     @field()
     myData: Dictionary = {};

     mounted() {
       this.watch('myData.foo', {flush: 'sync', collapse: false}, (val) => {
         console.log(val);
       });

       // These mutations will be ignored when using watching based on accessors due to technical restrictions,
       // because the property was never defined before
       this.myData.foo = 1;
       Object.set(this, 'myData.foo', 2);

       // This mutation will be caught
       this.field.set('myData.foo', 3);

       // This mutation is unobservable and removes all observables from the property.
       // To restore the view, use `field.set` again.
       delete this.myData.foo;

       // Or prefer this
       this.field.delete('myData.foo');
     }
   }
   ```

2. Prelude methods are not aware of component states and hooks.
   For example, before the component switches to the "created" hook,
   we cannot directly set the field values because all fields are initialized during `created`.
   In this case, the `Field` class can optionally set the value to the internal store.

   ```typescript
   import iBlock, { component, prop, field } from 'components/super/i-block/i-block';

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
       // so when we check it, we get `undefined`
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

3. The `field` methods have additional overloads that allow providing a function to return a property value or a key.

   ```typescript
   import iBlock, { component, prop, field } from 'components/super/i-block/i-block';

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

Returns a property based on the specified path.
This method is plugged in by default.

```typescript
import iBlock, { component, field } from 'components/super/i-block/i-block';

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

    // 3
    console.log(this.field.get('foo.bla', {foo: {bla: 3}}));

    // 4
    console.log(this.field.get('foo.blaBar', {foo: {bla_bar: 4}}, (prop, obj) => Object.get(obj, prop.underscore())));
  }
}
```

### set

Sets a new property based on the specified path.
This method is plugged in by default.

```typescript
import iBlock, { component, field } from 'components/super/i-block/i-block';

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

Deletes a property based on the specified path.

```typescript
import iBlock, { component, field } from 'components/super/i-block/i-block';

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
