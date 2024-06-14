# components/friends/async-render

This module provides a class for rendering component fragments asynchronously.
It helps to optimize component rendering.

## How to Include this Module in Your Component?

By default, any component that inherits from [[iBlock]] has the `asyncRender` property.
However, to use the module methods, attach them explicitly to enable tree-shake code optimizations.
Place the required import declaration within your component file.

```typescript
import iBlock, { component } from 'components/super/i-block/i-block';
import AsyncRender, { iterate, forceRender } from 'components/friends/async-render';

// Import `iterate` and `forceRender` methods
AsyncRender.addToPrototype({iterate, forceRender});

@component()
export default class bExample extends iBlock {}
```

Alternatively, if you are using the module with Snakeskin helpers, all dependencies will be installed automatically.

```
< .container v-async-target
  += self.render({renderKey: 'Login Form', wait: 'promisifyOnce.bind(null, "forceRender")'})
    < b-button
      Press on me!

    < b-input :placeholder = 'Enter your name'

< button @click = emit('forceRender')
  Show form
```

## How does it work?

The class introduces a new method to create iterable objects: `asyncRender.iterate`, which should be used with the `v-for` directive.
Don't forget to declare where to mount dynamically rendered fragments.
To do this, place your code within another node marked by the `v-async-target` directive.

```
< .container v-async-target
  /// The first ten elements are rendered synchronously.
  /// After that, the remaining elements will be split into chunks of ten elements and rendered asynchronously.
  /// The rendering of async fragments does not force re-rendering of the main component template.
  < .&__item v-for = el in asyncRender.iterate(myData, 10)
    {{ el }}
```

As seen in the example, `iterate` splits iteration into separate chunks.
Essentially, the first chunk is rendered immediately, while the rest are rendered asynchronously.

Using the second parameter, we can control how many fragments can be placed within one render chunk (by default, the chunk size is equal to one).
Additionally, it is possible to skip several elements from the start. To do this, provide the second parameter as a tuple,
where the first parameter is the number to skip, and the second one is the render chunk size.

```
< .container v-async-target
  /// Skip the first fifteen elements and render by three elements per chunk
  < .&__item  v-for = el in asyncRender.iterate(myData, [15, 3])
    {{ el }}
```

The parameter for iterate can be any iterable JS value, such as arrays, maps, or sets.

```
< .container v-async-target
  < .&__item v-for = el in asyncRender.iterate([1, 2, 3])
    {{ el }}

< .container v-async-target
  < .&__item v-for = el in asyncRender.iterate(new Set([1, 2, 3]))
    {{ el }}

< .container v-async-target
  /// All built-in JS iterators are iterable objects
  < .&__item v-for = el in asyncRender.iterate(new Map([['a', 1], ['b', 2]]).entries())
    {{ el }}
```

Any string values are iterated by graphemes or letters, not by Unicode symbols.

```
< .container v-async-target
  /// 1, 😃, à, 🇷🇺, 👩🏽‍❤️‍💋‍👨
  < .&__item v-for = letter in asyncRender.iterate('1😃à🇷🇺👩🏽‍❤️‍💋‍👨')
    {{ letter }}
```

Any iterable element can be a promise. In that case, it will be rendered after being resolved.

```
< .container v-async-target
  < .&__item v-for = user in asyncRender.iterate([fetch('/user/1'), fetch('/user/2')])
    {{ user }}
```

Alternatively, we can use asynchronous iterable structures.

```
< .container v-async-target
  < .&__item v-for = user in asyncRender.iterate(asyncEventStream)
    {{ user }}
```

In addition to elements with promises or asynchronous iterable structures,
`asyncRender.iterate` can accept a promise that returns a valid value for iteration.

```
< .container v-async-target
  < .&__item v-for = user in asyncRender.iterate(fetch('/users'))
    {{ user }}
```

Also, the method supports iterating over JS objects.

```
< .container v-async-target
  /// To iterate objects, `Object.entries` is used
  < .&__item v-for = [key, value] in asyncRender.iterate({a: 1, b: 2})
    {{ key }} = {{ value }}
```

Finally, the method can create ranges and iterate through them if provided value is a number.

```
< .container v-async-target
  < .&__item v-for = i in asyncRender.iterate(10)
    {{ i }}

< .container v-async-target
  /// `true` is an alias for `Infinity`
  < .&__item v-for = i in asyncRender.iterate(true)
    {{ i }}

< .container v-async-target
  /// `false` is an alias for `-Infinity`
  < .&__item v-for = i in asyncRender.iterate(false)
    {{ i }}
```

`null` and `undefined` are cast to the empty iterator. It is useful when you provide a promise for iteration that can return a nullish value.

```
< .container v-async-target
  < .&__item v-for = el in asyncRender.iterate(null)
    {{ i }}

< .container v-async-target
  /// It's ok if `fetch` returns `null`
  < .&__item v-for = el in asyncRender.iterate(fetch('/users'))
    {{ i }}
```

The remaining primitive types are cast to a single-element iterator.

```
< .container v-async-target
  < .&__item v-for = el in asyncRender.iterate(Symbol('foo'))
    {{ el }}
```

## Events

| EventName                  | Description                                              | Payload description | Payload      |
|----------------------------|----------------------------------------------------------|---------------------|--------------|
| `asyncRenderChunkComplete` | One async chunk has been rendered                        | Task description    | `TaskParams` |
| `asyncRenderComplete`      | All async chunks from one render task have been rendered | Task description    | `TaskParams` |

## Additional options for iterations

As you might already know, you can specify a chunk size to render as the second parameter of `asyncRender.iterate`.
If the passed value for iteration is not a promise, asynchronous iterable structure, or does not contain promises as elements,
the first chunk can be rendered synchronously. Additionally, the iteration method can take an object with extra options for iterating.

### [weight = `1`]

The weight of one render chunk.
At the same tick, chunks with accumulated weight no more than the TASKS_PER_TICK constant can be rendered.
See `core/component/render/daemon` for more information.

### [useRaf = `false`]

If `true`, then all rendered fragments are inserted into the DOM using a `requestAnimationFrame` callback.
This can optimize the browser rendering process.

### [group]

A group name for manually clearing pending tasks via the `async` module.
Providing this value disables the automatic cleanup of render tasks on the `update` hook.
If this parameter is set as a function, the group name will be dynamically calculated on each iteration.

```
< .container v-async-target
  < .&__item v-for = el in asyncRender.iterate(100, 10, {group: 'listRendering'})
    {{ el }}

/// We should use a RegExp to clear tasks,
/// because each group has a group based on a template `asyncComponents:listRendering:${chunkIndex}`.
< button @click = async.clearAll({group: /:listRendering/})
  Cancel rendering
```

### [filter]

A function to filter elements for rendering.
If it returns a promise, the rendering process will wait for the promise to be resolved.
If the promise is resolved with `undefined`, the value will be interpreted as `true`.

```
< .container v-async-target
  /// Render only even values
  < .&__item v-for = el in asyncRender.iterate(100, 5, {filter: (el) => el % 2 === 0})
    {{ el }}

< .container v-async-target
  /// Render each element with the specified delay
  < .&__item v-for = el in asyncRender.iterate(100, {filter: (el) => async.sleep(100)})
    {{ el }}

< .container v-async-target
  /// Render each element after the specified event
  < .&__item v-for = el in asyncRender.iterate(100, 20, {filter: (el) => promisifyOnce('renderNextChunk')})
    {{ el }}

< button @click = emit('renderNextChunk')
  Render the next chunk
```

### [destructor]

The destructor for a rendered fragment.
It will be called before each asynchronously rendered fragment is removed from the DOM.
If the function returns `true`, the internal destructor of the `asyncRender` module will not be called.

## Methods

### forceRender

Restarts the `asyncRender` daemon to force the rendering of async chunks.
See `core/component/render/daemon` for more information.

### deferForceRender

Creates a task to restart the `asyncRender` daemon on the next tick.
See `core/component/render/daemon` for more information.

### waitForceRender

A factory to create filters for `AsyncRender`, which returns a new function.
The new function can return a boolean or promise. If the function returns a promise, it will be resolved after firing a `forceRender` event.

The main function can take an element name as the first parameter.
This element will be removed before resolving the resulting promise.

Note that the initial component rendering is the same as `forceRender`.
This function is useful for re-rendering a functional component without touching the parent state.

```
< button @click = asyncRender.forceRender()
  Re-render the component

< .&__container v-async-target
  < template v-for = el in asyncRender.iterate(true, { &
    filter: asyncRender.waitForceRender('content')
  }) .
    < .&__content
      {{ Math.random() }}

< .container v-async-target
  < template v-for = el in asyncRender.iterate(true, { &
    filter: asyncRender.waitForceRender((ctx) => ctx.$el.querySelector('.foo'))
  }) .
    < .&__content
      {{ Math.random() }}
```

### iterate

Creates an asynchronous render stream from the specified value.
It returns a list of elements for the first synchronous render.
This function helps optimize component rendering by splitting large render tasks into smaller ones.

```
/// Where to append asynchronous elements
< .container v-async-target
  /// Asynchronous rendering of components: only five elements per chunk
  < template v-for = el in asyncRender.iterate(largeList, 5)
    < my-component :data = el
```

## Snakeskin helpers

### render

This helper provides a convenient facade for the [[AsyncRender]] API.
You can use it when you need to create asynchronous conditional rendering of template fragments.

```
< .container v-async-target
  += self.render({renderKey: 'Login Form', wait: 'promisifyOnce.bind(null, "forceRender")'})
    < b-button
      Press on me!

    < b-input :placeholder = 'Enter your name'

< button @click = emit('forceRender')
  Show form
```

#### Enabling one-time rendering

By providing the `renderKey` option, you declare that this template fragment should be rendered once,
i.e., it won’t be re-rendered during the component state change. Keep in mind, the render key should be unique.

```
< .container v-async-target
  += self.render({renderKey: 'Login Form'})
    < b-button
      Login
```

#### Conditional rendering

If you want to render the fragment only after some event, provide the `wait` option.
This option expects a string expression (due to code-generation) with a function that returns a promise.

```
< .container v-async-target
  += self.render({wait: 'promisifyOnce.bind(null, "forceRender")'})
    < b-button
      Press on me!

    < b-input :placeholder = 'Enter your name'

< button @click = emit('forceRender')
  Show form
```
