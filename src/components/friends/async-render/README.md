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

## How Does It Work?

The class introduces a new method for creating iterable objects `asyncRender.iterate`,
which should be used in conjunction with the `v-for` directive.
Remember to specify where dynamically rendered fragments should be mounted.
To achieve this, place your code within another node designated by the `v-async-target` directive.

```
< .container v-async-target
  /// The first ten elements are rendered synchronously.
  /// Subsequently, remaining elements are divided into chunks of ten elements and rendered asynchronously.
  /// This asynchronous rendering of fragments does not trigger a re-render of the main component template.
  < .&__item v-for = el in asyncRender.iterate(myData, 10)
    {{ el }}
```

As seen in the example, `iterate` splits the iteration into separate chunks.
The first chunk is rendered immediately, while the later chunks are rendered asynchronously.

Using the second parameter, we can control how many fragments are placed within one render chunk
(by default, the chunk size is set to one).
Additionally, it is possible to skip several elements from the start.
To achieve this, provide the second parameter as a tuple,
in which the first element is the number of elements to skip, and the second specifies the render chunk size.

```
< .container v-async-target
  /// Skip the first fifteen elements and render by three elements per chunk
  < .&__item  v-for = el in asyncRender.iterate(myData, [15, 3])
    {{ el }}
```

The `iterate` parameter can accept any iterable JavaScript value, including arrays, maps, or sets.

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

Any string values are iterated by graphemes or letters, rather than by Unicode symbols.

```
< .container v-async-target
  /// 1, 😃, à, 🇷🇺, 👩🏽‍❤️‍💋‍👨
  < .&__item v-for = letter in asyncRender.iterate('1😃à🇷🇺👩🏽‍❤️‍💋‍👨')
    {{ letter }}
```

Any iterable element can be a promise. If so, it will be rendered after being resolved.

```
< .container v-async-target
  < .&__item v-for = user in asyncRender.iterate([fetch('/user/1'), fetch('/user/2')])
    {{ user }}
```

Alternatively, asynchronous iterable structures can be used.

```
< .container v-async-target
  < .&__item v-for = user in asyncRender.iterate(asyncEventStream)
    {{ user }}
```

In addition to handling elements with promises or asynchronous iterable structures,
`asyncRender.iterate` can also accept a promise that resolves to a value suitable for iteration.

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

Finally, if provided with a number, the method can create ranges and iterate through them.

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

Both `null` and `undefined` are cast to an empty iterator.
This is useful when a promise intended for iteration might return a nullish value.

```
< .container v-async-target
  < .&__item v-for = el in asyncRender.iterate(null)
    {{ i }}

< .container v-async-target
  /// It's ok if `fetch` returns `null`
  < .&__item v-for = el in asyncRender.iterate(fetch('/users'))
    {{ i }}
```

Other primitive types are converted into a single-element iterator.

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

## Additional Options for Iterations

As you may already be aware, a chunk size can be specified as the second parameter in `asyncRender.iterate`.
If the value passed for iteration is neither a promise, nor an asynchronous iterable structure,
nor contains promises as elements, the first chunk can be rendered synchronously.
Furthermore, the iteration method can accept an object containing additional options for iterating.

### [weight = `1`]

The weight of a single render chunk determines its processing cost.
During the same tick, only chunks with a combined weight that does not exceed
the `TASKS_PER_TICK` constant can be rendered.

See `core/component/render/daemon` for more information.

### [useRaf = `false`]

If set to true, then all rendered fragments are inserted into the DOM by using a `requestAnimationFrame` callback.
This can optimize the browser rendering process.

### [group]

A group name for manually clearing pending tasks via the [[Async]] module.
Setting this value disables the automatic cleanup of render tasks during the update hook.
If this parameter is provided as a function, the group name will be dynamically calculated in each iteration.

```
< .container v-async-target
  < .&__item v-for = el in asyncRender.iterate(100, 10, {group: 'listRendering'})
    {{ el }}

/// We should use a RegExp to clear tasks
/// because each group is named based on a template like `asyncComponents:listRendering:${chunkIndex}`
< button @click = async.clearAll({group: /:listRendering/})
  Cancel rendering
```

### [filter]

A function to filter elements for rendering.
If it returns a promise, the rendering process will pause until the promise resolves.
Should the promise resolve with `undefined`, the value will be interpreted as `true`.

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

The destructor for a rendered fragment is invoked before each asynchronously rendered fragment is
removed from the DOM.
If this function returns true, the internal destructor of the asyncRender module will not be executed.

## Methods

### forceRender

Restarts the asyncRender daemon to enforce the rendering of asynchronous chunks.
See `core/component/render/daemon` for more information.

### deferForceRender

Schedules a task to restart the asyncRender daemon on the next tick.
See `core/component/render/daemon` for more information.

### waitForceRender

A factory to create filters for AsyncRender; it returns a new function.
This new function can return either a boolean or a promise.
If the function returns a promise, it will be resolved after a forceRender event is triggered.

The main function can accept an element name as the first parameter.
This element will be removed before the returned promise is resolved.

Note that the initial component rendering is equivalent to a forceRender event.
This function is useful for re-rendering a functional component without altering the parent state.

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

Creates an asynchronous render stream from the specified value and returns a list of elements for
the first synchronous render.

This function optimizes component rendering by splitting large render tasks into smaller ones.

```
/// Where to append asynchronous elements
< .container v-async-target
  /// Asynchronous rendering of components: only five elements per chunk
  < template v-for = el in asyncRender.iterate(largeList, 5)
    < my-component :data = el
```

## Snakeskin Helpers

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

#### Enabling One-Time Rendering

By specifying the `renderKey` option, you indicate that the template fragment should be rendered only once
and will not be re-rendered during component state changes.
It is important to ensure that the `renderKey` is unique.

```
< .container v-async-target
  += self.render({renderKey: 'Login Form'})
    < b-button
      Login
```

#### Conditional Rendering

If you intend to render the fragment only after a certain event, you can use the `wait` option.
This option requires a string expression, which corresponds to code-generation,
that specifies a function returning a promise.

```
< .container v-async-target
  += self.render({wait: 'promisifyOnce.bind(null, "forceRender")'})
    < b-button
      Press on me!

    < b-input :placeholder = 'Enter your name'

< button @click = emit('forceRender')
  Show form
```
