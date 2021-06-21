# super/i-block/modules/field

This module provides a class with some helper methods to safely access component properties, i.e.,
you can use a complex path to property without fear of exception if the property doesn't exist.

The class contains three methods to use: `get`, `set`, `delete`.

```js
this.field.set('foo.bla.bar', 1);
this.field.get('foo.bla.bar');
this.field.delete('foo.bla.bar');
```

Each method can take an object to search (by default uses the self component).

```js
this.field.set('foo.bla.bar', 1, this.r);
this.field.get('foo.bla.bar', this.r);
this.field.delete('foo.bla.bar', this.r);
```

### Why not to use `Object.set/get/delete`?

There are three reasons to use `Field` instead of Prelude methods.

1. Prelude methods don't know about the component watchable properties, like system or regular fields, i.e.,
   if you are using watching based on accessors, you are risking getting into a trap when the property can't be watched
   because it never defined. Let's take a look at an example below.

  ```typescript
  import iBlock, { component, prop, field } from 'super/i-block/i-block';

  @component()
  export default class bExample extends iBlock {
    @field()
    myData: Dictionary = {};

    mounted() {
      this.watch('myData.foo', {immediate: true, collapse: false}, (val) => {
        console.log(val);
      });

      // These mutations will be ignored when using watching base on accessors due to technical restrictions
      // because the property was never defined before
      this.myData.foo = 1;
      Object.set(this, 'myData.foo', 2);

      // This mutation will be catched
      this.field.set('myData.foo', 3);

      // This mutation can't be watched and removes all watching from the property.
      // To restore watching, use `field.set` again.
      delete this.myData.foo;

      // Or prefer this
      this.field.delete('myData.foo');
    }
  }
  ```

2. Prelude methods don't know about the component statuses and hooks. For instance, before the component switches to
   the `created` hook, we can't directly set field values because all fields are initialized on `created`.
   In that case, the `Field` class can set a value into an internal buffer if necessary.

  ```typescript
  import iBlock, { component, prop, field } from 'super/i-block/i-block';

  @component()
  export default class bExample extends iBlock {
    @field()
    myData1!: Dictionary;

    @field()
    myData2!: Dictionary;

    beforeCreate() {
      // We can't set a field' value directly because the component not already switched to `created`
      this.myData1 = {foo: 1};

      // But we can use `field.set` to do it
      this.field.set('myData2.foo', 2);

      // The field value not already initialized,
      // that's why when we check it, we get `undefined`
      console.log(this.myData2 === undefined);

      // `field.get` takes a property value from the internal buffer
      console.log(this.field.get('myData2.foo') === 2);
    }

    mounted() {
      console.log(this.myData1 === undefined);
      console.log(this.myData2.foo === 2);
    }
  }
  ```

3. The `field` methods have additional overloads to provide a function that returns a property value or key.

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
