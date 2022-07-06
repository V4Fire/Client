# friends/module-loader

The module provides a class to manage dynamically loaded modules.

## How to include this module to your component

By default, any component that inherited from [[iBlock]] has the `moduleLoader` property.
But to use module methods, attach them explicitly to enable tree-shake code optimizations.
Just place the necessary import declaration within your component file.

```typescript
import iBlock, { component } from 'super/i-block/i-block';
import ModuleLoader, { load } from 'friends/module-loader';

// Import the `load` method
ModuleLoader.addToPrototype(load);

@component()
export default class bExample extends iBlock {}
```

Or, if you're using the module with Snakeskin helpers, all dependencies will be installed automatically.

```
< .container v-async-target
  += self.loadModules('form/b-button')
    < b-button
      Press on me!
```

## Usage

The module API is designed to use with [[AsyncRender]].
For instance, you can dynamically require dependencies when it needed and render a fragment that uses these modules asynchronously.

```
/// Don't forget to declare where to mount dynamically rendered fragments
< .container v-async-target
  {{ moduleLoader.addToBucket('form', {id: 'form/b-button', load: () => import('form/b-button')}) }}
  {{ moduleLoader.addToBucket('form', {id: 'form/b-input', load: () => import('form/b-input')}) }}

  < .form v-for = _ in asyncRender.iterate(moduleLoader.loadBucket('form'))
    < b-button
      Press on me!

    < b-input :placeholder = 'Enter your name'
```

### Using Snakeskin helpers

Manual use of the module within templates forces you to write a lot of boilerplate code.
To fix this, you should use the special Snakeskin helpers available to all [[iBlock]] heirs.

```
< .container v-async-target
  += self.loadModules(['form/b-button', 'form/b-input'])
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
If some modules are already loaded, they won’t be loaded twice.
If all specified modules are already loaded, the function returns a simple value, but not a promise.
The resulting value is designed to use with [[AsyncRender]].

```js
const modules = await this.moduleLoader.load(
  {
    id: 'form/b-button',
    load: () => import('form/b-button')
  },

  {
    // If you don't provide a module identifier, it won't be cached
    load: () => import('form/b-input')
  },
);

[[/* Module 1 */, /* Module 2 */]]
console.log([...modules]);
```

### addToBucket

Adds the specified modules to a load bucket by the specified name.
Notice, adding modules don’t force them to load. To load the created bucket, use the `loadBucket` method.
The function returns the number of added modules in the bucket.

```js
this.moduleLoader.addToBucket('form', {
  id: 'form/b-button',
  load: () => import('form/b-button')
});

this.moduleLoader.addToBucket('form', {
  // If you don't provide a module identifier, it won't be cached
  load: () => import('form/b-input')
});
```

### loadBucket

Loads a bucket of modules by the specified name.
If some modules are already loaded, they won’t be loaded twice.
If all specified modules are already loaded, the function returns a simple value, but not a promise.
The resulting value is designed to use with [[AsyncRender]].

```js
this.moduleLoader.addToBucket('form', {
  id: 'form/b-button',
  load: () => import('form/b-button')
});

await this.moduleLoader.addToBucket('form', {
  // If you don't provide a module identifier, it won't be cached
  load: () => import('form/b-input')
});

[[/* Module 1 */, /* Module 2 */]]
console.log([...await this.moduleLoader.loadBucket('form')]);
```

## Snakeskin helpers

### loadModules

Loads modules by the specified paths and dynamically inserted the provided content when it loaded.

```
< .container v-async-target
  /// You can provide a path to module or list of paths
  += self.loadModules(['form/b-button', 'form/b-input'])
    < b-button
      Press on me!

    < b-input :placeholder = 'Enter your name'
```

#### Enabling one time rendering

Providing the `renderKey` option you declare this template fragment should be rendered once,
i.e. it won’t be re-rendered during the component state change. Mind, the render key should be unique.

```
< .container v-async-target
  += self.loadModules('form/b-button', {renderKey: 'Login Form'})
    < b-button
      Login
```

#### Conditional rendering

If you want render the fragment only after some event, provide the `wait` option.
This option expects a string expression (cause it code-generation) with a function that returns a promise.

```
< .container v-async-target
  += self.loadModules(['form/b-button', 'form/b-input'], {wait: 'promisifyOnce.bind(null, "forceRender")'})
    < b-button
      Press on me!

    < b-input :placeholder = 'Enter your name'

< button @click = emit('forceRender')
  Show form
```
