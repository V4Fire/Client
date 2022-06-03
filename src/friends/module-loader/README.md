# friends/module-loader

This module provides a class to manage dynamically loaded modules.
Basically, this module is used with [[AsyncRender]].

## How to include this module to your component

By default, any components that inherited from [[iBlock]] have the `moduleLoader` property.
But to use module methods, you should attach them explicitly to enable tree-shake code optimizations.
Just place a necessary import declaration within your component file.

```typescript
import iBlock, { component } from 'super/i-block/i-block';
import ModuleLoader, { load } from 'friends/module-loader';

// Import the `load` method
ModuleLoader.addToPrototype(load);

@component()
export default class bExample extends iBlock {}
```

## Usage

The module API is designed to use with [[AsyncRender]].
For instance, you can dynamically require dependencies when it needed and render a fragment that uses these modules asynchronously.

```
/// Don't forget to declare where to mount dynamically rendered fragments
< .container v-async-target
  {{ moduleLoader.add('form', {id: 'form/b-button', load: () => import('form/b-button')}) }}
  {{ moduleLoader.add('form', {id: 'form/b-input', load: () => import('form/b-input')}) }}

  < .form v-for = _ in asyncRender.iterate(moduleLoader.loadBucket('form'))
    < b-button
      Press on me!

    < b-input :placeholder = 'Enter your name'
```

## Methods

### load

Loads the specified modules.
If some modules are already loaded, they won’t be loaded twice.
If all specified modules are already loaded, the function returns a simple value, but not a promise.
The resulting value is designed to use with [[AsyncRender]].

### addModulesToBucket

Adds the specified modules to a load bucket by the specified name.
Notice, adding modules don’t force them to load. To load the created bucket, use the `loadBucket` method.
The function returns the number of added modules in the bucket.

### loadBucket

Loads a bucket of modules by the specified name.
If some modules are already loaded, they won’t be loaded twice.
If all specified modules are already loaded, the function returns a simple value, but not a promise.
The resulting value is designed to use with [[AsyncRender]].
