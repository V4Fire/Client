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

Despite the seeming far-fetched ness of this example, this situation arises in practice quite often when we work with a component
not in the body of its class when describing it, but by calling its methods from outside. For example, from a directive or by reference.

But how can this situation be improved so that we can call any method of the component and not think if it can be called or not?
Solving this problem requires an integrated approach.

First, we need to introduce a special status for components that displays their state: the component is loading, the component is ready,
and so on. We already have a similar status - these are component lifecycle hooks, like `created` or `mounted`.
But they don't reflect the component state in terms of loading. For example, a component can be mounted, but in fact
show a spinner and load data. Therefore, all V4Fire components have the special `componentStatus` property.
This property can take the following values:

* `unloaded` - the component has just been created, but does not load any data;
* `loading` - the component loads its data;
* `beforeReady` - the component has loaded all the necessary data and is preparing to update its template;
* `ready` - the component has loaded all the necessary data and started updating the template;
* `inactive` - the component is deactivated (see `super/i-block/modules/activation`);
* `destroyed` - the component is destroyed.

The next step is to introduce a special protocol: when a component is created, it calls its `initLoad` method.
This method, depending on the component parameters, can either immediately switch it to `ready` (nothing needs to be loaded),
or initialize the loading of resources, switch the component to the `loading` status, and after all the resources are loaded,
switch it to ` ready` and initialize re-rendering (if necessary). Let's rewrite our example to apply the described approach.

```typescript
import iBlock, { component, field, wait } from 'super/i-block/i-block';

interface User {
  firstName: string;
  lastName: string;
  age: number;
}

@component()
class bExample extends iBlock {
  @field()
  user?: User;

  // Pay attention to the decorator
  @wait('ready')
  getUserName(): string {
    return `${this.user?.firstName} ${this.user.lastName}`;
  }

  async initLoad() {
    this.componentStatus = 'loading';

    const user = await (await fetch('//get-user').json());

    // To reduce the number of asynchronous component state changes, we use a special synchronization method.
    // It will execute the given function when all other requested resources (if any) have also been loaded.
    this.lfs.execCbAtTheRightTime(() => {
      this.user = user;
    });

    super.initLoad();
  }
}
```

Notice the `@wait` decorator. We explicitly declare that the method expects the component to be in the `ready` state.
And if at the time of calling this method the component is in a different state, then the method will return a Promise,
which will resolve with the result of the method when the component switches to the state we need.

```typescript
import iBlock, { component, field, wait } from 'super/i-block/i-block';

interface User {
  firstName: string;
  lastName: string;
  age: number;
}

@component()
class bExample extends iBlock {
  @field()
  user?: User;

  // Pay attention to the decorator
  @wait('ready')
  getUserName(): string | Promise<string> {
    return `${this.user?.firstName} ${this.user.lastName}`;
  }

  async initLoad() {
    // ...
  }

  async created() {
    // `await` works correctly with both promises and regular values
    const user = await this.getUserName();
    console.log(user);
  }
}
```

As you can see, the use of the `wait` decorator introduces a clear contract for when which method can be called, and besides,
it guarantees its execution. Please note that if the component is already in the required state, then the method will be called immediately and
return the result without a promise wrapper. If this behavior is not suitable, then you can specify that the promise is always returned
using the `deffer` option.

```typescript
import iBlock, { component, field, wait } from 'super/i-block/i-block';

interface User {
  firstName: string;
  lastName: string;
  age: number;
}

@component()
class bExample extends iBlock {
  @field()
  user?: User;

  @wait('ready', {defer: true})
  getUserName(): Promise<string> {
    return `${this.user?.firstName} ${this.user.lastName}`;
  }
}
```

It is also allowed to use `defer` without specifying a status to wait. This will make your method deferred, i.e. it won't start right away.
And if you pass additional [[Async]] parameters, then you can make logic so that adjacent calls to such a method collapse.
This is very handy when you have expensive methods and want to minimize their calls.

```typescript
import iBlock, { component, field, wait } from 'super/i-block/i-block';

@component()
class bExample extends iBlock {
  @wait({defer: true, label: 'recalcDOM'})
  recalcDOM(): Promise<void> {
    // ...
  }

  mounted() {
    this.recalcDOM();
    this.recalcDOM();
    this.recalcDOM();
    this.recalcDOM();
    this.recalcDOM();
    this.recalcDOM();
  }
}
```

You can specify `label`, `group` and `join` options. The default strategy is `replace` for `join` if the method has no arguments,
or `true` if any.
