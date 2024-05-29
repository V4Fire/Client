# components/friends/module-loader

This module provides a class to manage dynamically loaded modules.

## How to Include this Module in Your Component?

By default, any component that inherits from [[iBlock]] has the `moduleLoader` property.
However, to use the module methods, attach them explicitly to enable tree-shake code optimizations.
Place the required import declaration within your component file.

```typescript
import iBlock, { component } from 'components/super/i-block/i-block';
import ModuleLoader, { load } from 'components/friends/module-loader';

// Import the `load` method
ModuleLoader.addToPrototype({load});

@component()
export default class bExample extends iBlock {}
```

Alternatively, if you're using the module with Snakeskin helpers, all dependencies will be installed automatically.

```
< .container v-async-target
  += self.loadModules('components/form/b-button')
    < b-button
      Press on me!
```

## Usage

The module API is designed for use with [[AsyncRender]].
For example, you can dynamically require dependencies as needed and render a fragment
that uses these modules asynchronously.

```
/// Don't forget to declare where to mount dynamically rendered fragments
< .container v-async-target
  {{ moduleLoader.addToBucket('form', {id: 'components/form/b-button', load: () => import('components/form/b-button')}) }}
  {{ moduleLoader.addToBucket('form', {id: 'components/form/b-input', load: () => import('components/form/b-input')}) }}

  < .form v-for = _ in asyncRender.iterate(moduleLoader.loadBucket('form'))
    < b-button
      Press on me!

    < b-input :placeholder = 'Enter your name'
```

### Using Snakeskin helpers

Manual usage of the module within templates requires writing a lot of boilerplate code.
To avoid this, you should use the special Snakeskin helpers available to all [[iBlock]] descendants.

```
< .container v-async-target
  += self.loadModules(['components/form/b-button', 'components/form/b-input'])
    < b-button
      Press on me!

    < b-input :placeholder = 'Enter your name'

  += self.render({wait: 'promisifyOnce.bind(null, 'forceRender')'})
    Hello there!

  < button @click = emit('forceRender')
    Show hidden content
```

## Methods

### load

Loads the specified modules.
If some modules are already loaded, they won't be loaded again.
If all specified modules are already loaded, the function returns a simple value instead of a promise.
The resulting value is intended for use with [[AsyncRender]].

```js
const modules = await this.moduleLoader.load(
  {
    id: 'components/form/b-button',
    load: () => import('components/form/b-button')
  },

  {
    // If you don't provide a module identifier, it won't be cached
    load: () => import('components/form/b-input')
  },
);

[[/* Module 1 */, /* Module 2 */]]
console.log([...modules]);
```

### addToBucket

Adds the specified modules to a load bucket under the passed name.
Note that adding modules does not trigger their loading.
To load the created bucket, use the `loadBucket` method.
The function returns the number of modules added to the bucket.

```js
this.moduleLoader.addToBucket('form', {
  id: 'components/form/b-button',
  load: () => import('components/form/b-button')
});

this.moduleLoader.addToBucket('form', {
  // If you don't provide a module identifier, it won't be cached
  load: () => import('components/form/b-input')
});
```

### loadBucket

Loads a bucket of modules by the specified name.
If some modules are already loaded, they won't be loaded again.
If all specified modules are already loaded, the function returns a simple value instead of a promise.
The resulting value is intended for use with [[AsyncRender]].

```js
this.moduleLoader.addToBucket('form', {
  id: 'components/form/b-button',
  load: () => import('components/form/b-button')
});

await this.moduleLoader.addToBucket('form', {
  // If you don't provide a module identifier, it won't be cached
  load: () => import('components/form/b-input')
});

[[/* Module 1 */, /* Module 2 */]]
console.log([...await this.moduleLoader.loadBucket('form')]);
```

### sendSignal

Sends a signal to load the modules associated with the specified name.

```
< . v-async-target
  += self.loadModules('base/b-settings', { &
      renderKey: 'b-settings',
      wait: "moduleLoader.waitSignal('b-settings')"
  }) .
```

```js
this.moduleLoader.sendSignal('b-settings');
```

### waitSignal

Returns a function that, when called, returns a promise.
This promise resolves when the signal to load the associated modules is received.
The resulting value is intended for use with [[AsyncRender]].

```
< . v-async-target
  += self.loadModules('base/b-settings', { &
      renderKey: 'b-settings',
      wait: "moduleLoader.waitSignal('b-settings')"
  }) .
```

## Snakeskin helpers

### loadModules

Loads modules by the specified paths and dynamically inserts the provided content when they are loaded.

```
< .container v-async-target
  /// You can provide a path to module or list of paths
  += self.loadModules(['components/form/b-button', 'components/form/b-input'])
    < b-button
      Press on me!

    < b-input :placeholder = 'Enter your name'
```

#### Enabling one-time rendering

By providing the `renderKey` option, you declare that this template fragment should be rendered once,
meaning it won't be re-rendered during the component state change. Keep in mind that the render key should be unique.

```
< .container v-async-target
  += self.loadModules('components/form/b-button', {renderKey: 'Login Form'})
    < b-button
      Login
```

#### Conditional rendering

If you want to render the fragment only after a specific event, provide the `wait` option.
This option expects a string expression (because it is code-generation) with a function that returns a promise.

```
< .container v-async-target
  += self.loadModules(['components/form/b-button', 'components/form/b-input'], {wait: 'promisifyOnce.bind(null, "forceRender")'})
    < b-button
      Press on me!

    < b-input :placeholder = 'Enter your name'

< button @click = emit('forceRender')
  Show form
```

Alternatively, you can use the Signal API to defer loading modules.

```
< .container v-async-target
  += self.loadModules(['components/form/b-button', 'components/form/b-input'], {wait: 'moduleLoader.waitSignal("load-controls")'})
    < b-button
      Press on me!

    < b-input :placeholder = 'Enter your name'
```

```
this.moduleLoader.sendSignal('load-controls');
```
