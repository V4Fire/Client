# super/i-block/modules/decorators

This module re-exports the base decorators from `core/component/decorators` and also provides additional decorators.

## Re-exported decorators

* `@component` to register a new component;
* `@prop` to declare a component input property (aka "prop");
* `@field` to declare a component field;
* `@system` to declare a component system field (system field mutations never cause components to re-render);
* `@computed` to attach meta information to a component computed field or accessor;
* `@hook` to attach a hook listener;
* `@watch` to attach a watcher.

For more information, please refer `core/component/decorators` documentation.

## Decorators

### wait

This decorator solves the problem of calling component methods in a state when the component is not yet ready to do so.
Imagine a situation where your component needs to load user data from the server and then store it as a property of the component.
And you have a method that does something with the loaded data.

```typescript
import iBlock, { component, field } from 'super/i-block/i-block';

interface User {
  firstName: string;
  lastName: string;
  age: number;
}

@component()
class bExample extends iBlock {
  @field()
  user?: User;

  getUserName(): string {
    return `${this.user?.firstName} ${this.user.lastName}`;
  }

  async created() {
    // Oops, the result is `undefined undefined`
    console.log(this.getUserName());

    this.user = await (await fetch('//get-user').json());
  }
}
```

As you can see in the example, we deliberately violated the API contract and called the `getUserName` method before
the component loaded the data. It is logical that the result of the method in this case is incorrect and can lead to errors.

Despite the seeming far-fetchedness of this example, this situation arises in practice quite often when we work with a component
not in the body of its class when describing it, but by calling its methods from outside. For example, from a directive or by reference.
