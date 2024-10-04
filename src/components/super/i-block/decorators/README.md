# components/super/i-block/decorators

This module re-exports the base decorators from `core/component/decorators` and also provides additional decorators.

## Re-exported Decorators

* `@component` to register a new component;
* `@prop` to declare a component input property (aka "prop");
* `@field` to declare a component field;
* `@system` to declare a component system field (system field mutations never cause components to re-render);
* `@computed` to attach meta-information to a component computed field or accessor;
* `@hook` to attach a hook listener;
* `@watch` to attach a watcher.

For more information, please refer `core/component/decorators` documentation.

## Decorators

### wait

This decorator addresses the issue of invoking component methods at a time when the component is not yet ready.
Imagine a scenario where your component needs to load user data from a server
and then store it as a property of the component.
You might have a method that processes this loaded data.

```typescript
import iBlock, { component, field } from 'components/super/i-block/i-block';

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

As demonstrated in the example, we intentionally breached the API contract by invoking the `getUserName` method
before the data was loaded into the component.
Logically, the result of this method in such cases is incorrect and can lead to errors.

Despite the seemingly contrived nature of this example, such situations commonly occur in practice,
especially when we interact with a component not within the body of its class during development,
but by invoking its methods externally.
This can happen, for example, through a directive or by reference.

But how can we improve this situation so that we can invoke any method of the component without worrying about
whether it is safe to do so?
Addressing this issue requires a holistic approach.

First, we need to introduce a special status for components that reflects their state—including whether the component
is loading, ready, and so on.
While we already have similar statuses in the form of component lifecycle hooks, like `created` or `mounted`,
these do not specifically address the loading state of the component.
For instance, a component can be mounted but still be displaying an indicator and loading data.
Therefore, all V4Fire components feature a special `componentStatus` property, which can assume the following values:

* `unloaded` - the component has just been created, but does not load any data;
* `loading` - the component is currently loading its data;
* `beforeReady` - the component has loaded all necessary data and is preparing to update its template;
* `ready` - the component has loaded all necessary data and has begun updating the template;
* `inactive` - the component is deactivated (see `components/super/i-block/modules/activation`);
* `destroyed` - the component is destroyed.

The next step involves introducing a special protocol:
when a component is created, it should invoke its `initLoad` method.
Depending on the component's parameters, this method may immediately transition the component
to the ready status if there is nothing to load.
Alternatively, it can initiate the loading of resources, switch the component to the loading status,
and upon completing the resource loading, transition it to the ready status and initiate re-rendering if necessary.
Let's revise our example to incorporate this approach.

```typescript
import iBlock, { component, field, wait } from 'components/super/i-block/i-block';

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

    // To minimize asynchronous state changes, a special synchronization method is used.
    // This method executes the specified function only after all other requested resources have been loaded, if any.
    this.lfs.execCbAtTheRightTime(() => {
      this.user = user;
    });

    super.initLoad();
  }
}
```

Take note of the `@wait` decorator.
It explicitly indicates that the method expects the component to be in the `ready` state.
If the method is called while the component is in a different state, it will return a Promise.
This Promise resolves with the method's result once the component transitions to the required `ready` state.

```typescript
import iBlock, { component, field, wait } from 'components/super/i-block/i-block';

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

As illustrated, the use of the `@wait` decorator establishes a clear contract indicating when a method can be called,
and additionally, guarantees its execution.
It is important to note that if the component is already in the required state when the method is called,
the method will execute immediately and return the result directly, without wrapping it in a Promise.
If consistent behavior is desired regardless of the component's state,
you can specify that a Promise should always be returned by using the `defer` option.

```typescript
import iBlock, { component, field, wait } from 'components/super/i-block/i-block';

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

The `defer` option can also be used without specifying a particular status to wait for.
This setup makes the method deferred, meaning it will not execute immediately.
Furthermore, if you include additional [[Async]] parameters,
you can configure the method so that successive calls are consolidated.
This feature is especially useful when dealing with expensive methods, as it helps minimize their execution.

```typescript
import iBlock, { component, field, wait } from 'components/super/i-block/i-block';

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

You can specify the `label`, `group`, and `join` options for method calls.
The default `join` strategy varies based on the method's arguments:
it defaults to `replace` if the method has no arguments, or 'true' if there are any arguments.
This allows for more controlled behavior in managing concurrent method executions.
