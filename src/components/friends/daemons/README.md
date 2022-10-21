# components/friends/daemons

This module provides a class to create daemons associated with a component.

## How to include this module to your component?

By default, any component that inherited from [[iBlock]] has the `daemons` property.
But to use module methods, attach them explicitly to enable tree-shake code optimizations.
Just place the necessary import declaration within your component file.

```typescript
import iBlock, { component } from 'components/super/i-block/i-block';
import Daemons, { init } from 'components/friends/daemons';

// Import the `init` method
Daemons.addToPrototype(init);

@component()
export default class bExample extends iBlock {}
```

## What is a daemon?

Demons in V4Fire terminology are called modules that are associated with a component, but are not part of it.
We can say that a demon is an aspect from [AOP](https://en.wikipedia.org/wiki/Aspect-oriented_programming).
Since daemons are not part of the component, we can easily add or remove them depending on the project.

Daemons use the component context to which it is associated. From the daemon, you can call any non-private methods of the component or
listen to its events. If possible, you should not try to mutate properties of the associated component: you should use this feature
only in extreme cases and with the utmost care.

## Attaching daemons to a component

To add a daemon to a component, simply add it to the `daemons` static property.
Also, don't forget to import the `init` method.

```typescript
import iBlock, { component, field } from 'components/super/i-block/i-block';
import Daemons, { init, DaemonsDict } from 'components/friends/daemons';

// Import the `init` method
Daemons.addToPrototype(init);

@component()
export default class bExample extends iBlock {
  @field()
  someProperty: number = 0;

  static daemons: DaemonsDict = {
    logger: {
      hook: ['created', 'mounted'],
      watch: ['someProperty', '?$el:click'],

      // This function will be called on `created` and `mounted` hooks,
      // as well as on `someProperty` property change and `click` event on the component root node
      fn: console.log
    }
  };

  mounted() {
    this.async.setInterval(() => {
      this.someProperty++;
    }, 100)
  }
}
```

## Daemon creation options

### fn

A function that is called by the daemon.
The function context is the component that the daemon is bound to.
The function arguments are taken from the handlers that the daemon is binding on.

```typescript
import iBlock, { component, field } from 'components/super/i-block/i-block';
import Daemons, { init, DaemonsDict } from 'components/friends/daemons';

// Import the `init` method
Daemons.addToPrototype(init);

@component()
export default class bExample extends iBlock {
  @field()
  someProperty: number = 0;

  static daemons: DaemonsDict = {
    logger: {
      watch: 'someProperty',
      fn(this: bExample, newValue, oldValue, info) {
        console.log(newValue, oldValue, info);
      }
    }
  };

  mounted() {
    this.async.setInterval(() => {
      this.someProperty++;
    }, 100)
  }
}
```

### [immediate = `false`]

If true, the daemon function is called immediately when the listener event fires.

```typescript
import iBlock, { component, field } from 'components/super/i-block/i-block';
import Daemons, { init, DaemonsDict } from 'components/friends/daemons';

// Import the `init` method
Daemons.addToPrototype(init);

@component()
export default class bExample extends iBlock {
  @field()
  someProperty: number = 0;

  static daemons: DaemonsDict = {
    logger: {
      immediate: true,
      watch: 'someProperty',

      fn(this: bExample, newValue, oldValue) {
        // 1 0
        // 2 1
        // 3 2
        console.log(newValue, oldValue);
      }
    }
  };

  mounted() {
    this.someProperty++;
    this.someProperty++;
    this.someProperty++;
  }
}
```

### [hook]

A component hook (or hooks) on which the daemon function should be called.

```typescript
import iBlock, { component } from 'components/super/i-block/i-block';
import Daemons, { init, DaemonsDict } from 'components/friends/daemons';

// Import the `init` method
Daemons.addToPrototype(init);

@component()
export default class bExample extends iBlock {
  static daemons: DaemonsDict = {
    createdLogger: {
      hook: 'created',
      fn: () => console.log("I'am created")
    },

    logger: {
      hook: ['created', 'mounded'],
      fn(this: bExample) {
        console.log(`The component hook is ${this.hook}`);
      }
    }
  };
}
```

### [watch]

A path (or paths) to the component property or event on which the daemon function should be called.
See the `core/component/decorators/watch` module for more information.

```typescript
import iBlock, { component, field } from 'components/super/i-block/i-block';
import Daemons, { init, DaemonsDict } from 'components/friends/daemons';

// Import the `init` method
Daemons.addToPrototype(init);

@component()
export default class bExample extends iBlock {
  @field()
  someProperty: number = 0;

  @field()
  anotherProperty: number = 0;

  static daemons: DaemonsDict = {
    logger: {
      watch: ['someProperty', {path: 'anotherProperty', flush: 'sync'}],

      fn(this: bExample, newValue, oldValue) {
        console.log(newValue, oldValue);
      }
    }
  };

  mounted() {
    this.someProperty++;
    this.anotherProperty++;
  }
}
```

### [wait]

Sets the `componentStatus` value for the associated component on which the daemon function can be called.
See the `components/super/i-block/decorators` module for more information.

```typescript
import iBlock, { component, field } from 'components/super/i-block/i-block';
import Daemons, { init, DaemonsDict } from 'components/friends/daemons';

// Import the `init` method
Daemons.addToPrototype(init);

@component()
export default class bExample extends iBlock {
  @field()
  someProperty: number = 0;

  static daemons: DaemonsDict = {
    logger: {
      wait: 'ready',
      watch: 'someProperty',

      fn(this: bExample, newValue, oldValue) {
        console.log(newValue, oldValue);
      }
    }
  };

  mounted() {
    this.someProperty++;
  }
}
```

### [group]

A name of the group the daemon belongs to. The parameter is provided to [[Async]].

```typescript
import iBlock, { component, field } from 'components/super/i-block/i-block';
import Daemons, { init, DaemonsDict } from 'components/friends/daemons';

// Import the `init` method
Daemons.addToPrototype(init);

@component()
export default class bExample extends iBlock {
  @field()
  someProperty: number = 0;

  static daemons: DaemonsDict = {
    logger: {
      group: 'logger',
      watch: 'someProperty',

      fn(this: bExample, newValue, oldValue) {
        console.log(newValue, oldValue);
      }
    }
  };

  mounted() {
    this.someProperty++;
    this.async.clearAll({group: 'logger'});
    this.someProperty++;
  }
}
```

### [label]

A label associated with the daemon. The parameter is provided to [[Async]].

```typescript
import iBlock, { component, field } from 'components/super/i-block/i-block';
import Daemons, { init, DaemonsDict } from 'components/friends/daemons';

// Import the `init` method
Daemons.addToPrototype(init);

@component()
export default class bExample extends iBlock {
  @field()
  someProperty: number = 0;

  static daemons: DaemonsDict = {
    logger: {
      label: 'logger',
      watch: 'someProperty',
      fn: console.log
    },

    anotherLogger: {
      label: 'logger',
      watch: 'someProperty',
      fn: console.log
    }
  };

  mounted() {
    this.someProperty++;
  }
}
```

### [join]

A strategy type to join conflict tasks. The parameter is provided to [[Async]].

```typescript
import iBlock, { component, field } from 'components/super/i-block/i-block';
import Daemons, { init, DaemonsDict } from 'components/friends/daemons';

// Import the `init` method
Daemons.addToPrototype(init);

@component()
export default class bExample extends iBlock {
  @field()
  someProperty: number = 0;

  static daemons: DaemonsDict = {
    logger: {
      label: 'logger',
      join: true,
      watch: 'someProperty',
      fn: console.log
    },

    anotherLogger: {
      label: 'logger',
      join: true,
      watch: 'someProperty',
      fn: console.log
    }
  };

  mounted() {
    this.someProperty++;
  }
}
```
