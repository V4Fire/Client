# components/friends/daemons

This module provides a class for creating daemons associated with a component.

## How to Include this Module in Your Component?

By default, any component that inherits from [[iBlock]] will have the `daemons` property.
However, to utilize module methods, you must attach them explicitly to enable tree-shake code optimizations.
To do this, place the necessary import declaration within your component file.

```typescript
import iBlock, { component } from 'components/super/i-block/i-block';
import Daemons, { init } from 'components/friends/daemons';

// Import the `init` method
Daemons.addToPrototype({init});

@component()
export default class bExample extends iBlock {}
```

## What is a Daemon?

In V4Fire terminology, daemons are modules that are associated with a component but are not part of it.
We can say that a daemon is an aspect from [AOP](https://en.wikipedia.org/wiki/Aspect-oriented_programming).
Since daemons are not part of the component, we can easily add or remove them depending on the project.

Daemons use the component context to which they are associated. From the daemon, you can call any non-private methods of the component or
listen to its events. If possible, you should avoid mutating properties of the associated component; this feature
should be used only in extreme cases and with the utmost care.

## Attaching Daemons to a Component

To add a daemon to a component, simply add it to the `daemons` static property.
Also, don't forget to import the `init` method.

```typescript
import iBlock, { component, field } from 'components/super/i-block/i-block';
import Daemons, { init, DaemonsDict } from 'components/friends/daemons';

// Import the `init` method
Daemons.addToPrototype({init});

@component()
export default class bExample extends iBlock {
  @field()
  someProperty: number = 0;

  static daemons: DaemonsDict = {
    logger: {
      hook: ['created', 'mounted'],
      watch: ['someProperty', '?$el:click'],

      // This function will be called on the `created` and `mounted` hooks,
      // as well as on the `someProperty` property change and the `click` event on the component's root node
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

## Daemon Creation Options

### fn

A function that is called by the daemon.
The function context is the component to which the daemon is bound.
The function arguments are taken from the handlers that the daemon is bound to.

```typescript
import iBlock, { component, field } from 'components/super/i-block/i-block';
import Daemons, { init, DaemonsDict } from 'components/friends/daemons';

// Import the `init` method
Daemons.addToPrototype({init});

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

If set to `true`, the daemon function is called immediately when the listener event is triggered.

```typescript
import iBlock, { component, field } from 'components/super/i-block/i-block';
import Daemons, { init, DaemonsDict } from 'components/friends/daemons';

// Import the `init` method
Daemons.addToPrototype({init});

@component()
export default class bExample extends iBlock {
  @field()
  someProperty: number = 0;

  static daemons: DaemonsDict = {
    logger: {
      immediate: true,
      watch: 'someProperty',

      fn(this: bExample, newValue, oldValue) {
        console.log(newValue, oldValue);
      }
    }
  };

  mounted() {
    // Will print to console: 1 0
    this.someProperty++;
    // Will print to console: 2 1
    this.someProperty++;
    // Will print to console: 3 2
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
Daemons.addToPrototype({init});

@component()
export default class bExample extends iBlock {
  static daemons: DaemonsDict = {
    createdLogger: {
      hook: 'created',
      fn: () => console.log("I'm created")
    },

    logger: {
      hook: ['created', 'mounted'],
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
Daemons.addToPrototype({init});

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

Sets the `componentStatus` value for the associated component, determining when the daemon function can be called.
See the `components/super/i-block/decorators` module for more information.

```typescript
import iBlock, { component, field } from 'components/super/i-block/i-block';
import Daemons, { init, DaemonsDict } from 'components/friends/daemons';

// Import the `init` method
Daemons.addToPrototype({init});

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
    // Nothing will be printed to the console
    this.someProperty++;
  }
}
```

### [group]

A name of the group to which the daemon belongs. The parameter is provided to [[Async]].

```typescript
import iBlock, { component, field } from 'components/super/i-block/i-block';
import Daemons, { init, DaemonsDict } from 'components/friends/daemons';

// Import the `init` method
Daemons.addToPrototype({init});

@component()
export default class bExample extends iBlock {
  @field()
  someProperty: number = 0;

  static daemons: DaemonsDict = {
    logger: {
      group: 'logger',
      watch: {
        path: 'someProperty',
        flush: 'sync'
      },

      fn(this: bExample, newValue, oldValue) {
        console.log(newValue, oldValue);
      }
    }
  };

  mounted() {
    // Nothing will be printed to the console
    this.someProperty++;
    // It will clear all pending daemons
    this.async.clearAll({group: 'logger'});
    // Will print to the console: 2 1
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
Daemons.addToPrototype({init});

@component()
export default class bExample extends iBlock {
  @field()
  someProperty: number = 0;

  static daemons: DaemonsDict = {
    logger: {
      label: 'logger',
      watch: 'someProperty',
      fn(this: bExample, newValue) {
        console.log('logger', newValue);
      }
    },

    anotherLogger: {
      label: 'logger',
      watch: 'someProperty',
      fn(this: bExample, newValue) {
        console.log('anotherLogger', newValue);
      }
    }
  };

  mounted() {
    // Will print to the console: "anotherLogger 1"
    this.someProperty++;
  }
}
```

### [join]

A strategy type for joining conflicting tasks. The parameter is provided to [[Async]].

```typescript
import iBlock, { component, field } from 'components/super/i-block/i-block';
import Daemons, { init, DaemonsDict } from 'components/friends/daemons';

// Import the `init` method
Daemons.addToPrototype({init});

@component()
export default class bExample extends iBlock {
  @field()
  someProperty: number = 0;

  static daemons: DaemonsDict = {
    logger: {
      label: 'logger',
      join: true,
      watch: 'someProperty',
      fn(this: bExample, newValue) {
        console.log('logger', newValue);
      }
    },

    anotherLogger: {
      label: 'logger',
      join: true,
      watch: 'someProperty',
      fn(this: bExample, newValue) {
        console.log('anotherLogger', newValue);
      }
    }
  };

  mounted() {
    // Will print to the console: "logger 1"
    this.someProperty++;
  }
}
```
