# components/super/i-block/base

This module offers a unified API for working with components

## API

### Associated types

The class declares two associated types, **Root** and **Component**, which are used to specify the types of components.

#### Root

The type of the root component, which can be accessed through the getter `r`.

```typescript
import iBlock, { component } from 'components/super/i-block/i-block';
import type iStaticPage from 'components/super/i-static-page/i-static-page';

@component()
export default class bExample extends iBlock {
  override readonly Root!: iStaticPage;
}
```

#### Component

The type of the superclass for all components.

```typescript
import iBlock, { component } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  override readonly Component!: iBlock;
}
```

### Fields

#### tmp

A temporary cache dictionary.
Mutation of this object does not cause the component to re-render.

#### reactiveTmp

A temporary cache dictionary.
Mutation of this object can cause the component to re-render.

### Getters

#### componentId

The unique component identifier.
The value is formed based on the passed prop or dynamically.

```typescript
import iBlock, { component } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  created() {
    console.log(this.componentId);
  }
}
```

#### componentName

The component name in dash-style without special postfixes like `-functional`.

```typescript
import iBlock, { component } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  created() {
    console.log(this.componentName); // b-example
  }
}
```

#### instance

A link to the component class instance.
Basically, this parameter is mainly used for `instanceof` checks and to get component default property values.
Mind, all components of the same type refer to the one shareable class instance.

```typescript
import iBlock, { component } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  created() {
    console.log(this.instance instanceof iBlock);
  }
}
```

#### self

A link to the component itself.

#### unsafe

An API for safely invoking some internal properties and methods of a component.
This parameter allows you to use protected properties and methods from outside the class without
causing TypeScript errors.
Use it when you need to decompose the component class into a composition of friendly classes.

```typescript
import iBlock, { component } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  created() {
    console.log(this.unsafe.meta);
  }
}
```

#### meta

A link to the component metaobject.
This object contains all information of the component properties, methods, etc.

```typescript
import iBlock, { component } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  created() {
    console.log(this.meta.methods);
  }
}
```

#### r

A link to the root component.

#### rootAttrs

A dictionary with additional attributes for the component's root element.

#### t

An alias for the `i18n` prop.

#### isFunctional

True if the component is a functional component.

#### isVirtualTpl

True if the component context is based on another component via `vdom.getRenderFn`.

#### $el

A link to the component's root element.

```typescript
import iBlock, { component } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  mounted() {
    console.log(this.$el);
  }
}
```

#### $refs

A dictionary with references to component elements that have the "ref" attribute.

#### $slots

A dictionary with available render slots.

#### $root

A link to the root component.

```typescript
import iBlock, { component } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  mounted() {
    console.log(this.$parent);
  }
}
```

#### $parent

A link to the parent component.

```typescript
import iBlock, { component } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  mounted() {
    console.log(this.$parent);
  }
}
```

#### $normalParent

A link to the closest non-functional parent component.

```typescript
import iBlock, { component } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  mounted() {
    console.log(this.$normalParent);
  }
}
```

#### $remoteParent

A link to the component parent if the current component was dynamically created and mounted.

#### $children

A list of child components.

```typescript
import iBlock, { component } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  mounted() {
    console.log(this.$children);
  }
}
```

#### $renderEngine

An API of the used render engine.

```typescript
import iBlock, { component } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  mounted() {
    console.log(this.$renderEngine.r.createCommentVNode('loopback'));
  }
}
```

### Methods

#### activate

Activates the component.
The deactivated component won't load data from its providers during initializing.

Essentially, you don't need to worry about component activation,
as it automatically synchronizes with the `keep-alive` mode or a specific component prop.

#### deactivate

Deactivates the component.
The deactivated component won't load data from its providers during initializing.

Essentially, you don't need to worry about component activation,
as it automatically synchronizes with the `keep-alive` mode or a specific component prop.

#### watch

Sets a watcher to the component/object property or event by the specified path.

When you observe changes to certain properties,
the event handler function can accept a second argument that references the old value of the property.
If the observed value is not a primitive type, the old value will be cloned from the original old value to
avoid having two references to the same object.

```typescript
import iBlock, { component, field, watch } from 'components/super/i-block/i-block';

@component()
class bExample extends iBlock {
  @field()
  list: Dictionary[] = [];

  @watch('list')
  onListChange(value: Dictionary[], oldValue: Dictionary[]): void {
    // true
    console.log(value !== oldValue);
    console.log(value[0] !== oldValue[0]);
  }

  // When you don't declare a second argument in the watcher,
  // the previous value isn't cloned
  @watch('list')
  onListChangeWithoutCloning(value: Dictionary[]): void {
    // true
    console.log(value === arguments[1]);
    console.log(value[0] === oldValue[0]);
  }

  // When you watch a property deeply and declare a second argument in the watcher,
  // the previous value is deeply cloned
  @watch({path: 'list', deep: true})
  onListChangeWithDeepCloning(value: Dictionary[], oldValue: Dictionary[]): void {
    // true
    console.log(value !== oldValue);
    console.log(value[0] !== oldValue[0]);
  }

  created() {
    this.list.push({});
    this.list[0].foo = 1;
  }
}
```

You need to use the special ":" delimiter within a path to listen to an event.
Also, you can specify an event emitter to listen for by writing a reference before the ":" character.
For instance:

1. `':onChange'` - will listen to the component `onChange` event;
2. `'localEmitter:onChange'` - will listen to the `onChange` event from `localEmitter`;
3. `'$parent.localEmitter:onChange'` - will listen to the `onChange` event from `$parent.localEmitter`;
4. `'document:scroll'` - will listen to the `scroll` event from `window.document`.

A link to the event emitter is taken from the component properties or the global object.
An empty reference '' is a reference to the component itself.

Also, if you are listening to an event, you can control when to start listening to the event by using special
characters at the beginning of the path string:

1. `'!'` - start listening to an event on the "beforeCreate" hook, e.g.: `'!rootEmitter:reset'`;
2. `'?'` - start listening to an event on the "mounted" hook, e.g.: `'?$el:click'`.

By default, all events start listening on the "created" hook.

To listen for changes to another observable, you need to specify the watch path as an object:

```
{
  ctx: linkToWatchObject,
  path?: pathToWatch
}
```

```js
// Watch for changes of `foo`
this.watch('foo', (val, oldVal) => {
  console.log(val, oldVal);
});

// Watch for changes of another watchable object
this.watch({ctx: anotherObject, path: 'foo'}, (val, oldVal) => {
  console.log(val, oldVal);
});

// Deep watch for changes of `foo`
this.watch('foo', {deep: true}, (val, oldVal) => {
  console.log(val, oldVal);
});

// Watch for changes of `foo.bla`
this.watch('foo.bla', (val, oldVal) => {
  console.log(val, oldVal);
});

// Listen to the `onChange` event of the component
this.watch(':onChange', (val, oldVal) => {
  console.log(val, oldVal);
});

// Listen to the `onChange` event of `parentEmitter`
this.watch('parentEmitter:onChange', (val, oldVal) => {
  console.log(val, oldVal);
});
```

#### nextTick

Returns a promise that will be resolved on the next render tick.

#### forceUpdate

Forces the component to re-render.

#### log

Logs the given message on behalf of the component.
The `core/log` module is used for logging, so see the documentation for this module for details.

All component messages are prefixed with `component:` and also contain the component name itself.
For example, `log('fBar')` from the `bExample` component will create a logging message: `component:fBar:b-example`.
If the component has the `globalName` prop specified, then the message will be as follows (for example,
`globalName` is equal to `myExample`): `component:global:myExample:fBar:b-example`.

By default, all messages have a logging level of `info`. Such messages will not be logged unless the component has
the `verbose` prop set to true. It is allowed to set the logging level explicitly.

```typescript
import iBlock, { component } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  created() {
    // Enable logging
    setEnv('log', {patterns: ['myMessage']});

    this.log('myMessage', 'some', 'parameters', () => 'the function will be called dynamically');
    this.log({context: 'myMessage', logLevel: 'error'});
  }
}
```
