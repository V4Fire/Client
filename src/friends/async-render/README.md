# friends/async-render

This module provides a class to render component fragments asynchronously.
It helps to optimize component rendering.

## How to include this module to your component?

By default, any component that inherited from [[iBlock]] has the `asyncRender` property.
But to use module methods, attach them explicitly to enable tree-shake code optimizations.
Just place the necessary import declaration within your component file.

```typescript
import iBlock, { component } from 'super/i-block/i-block';
import AsyncRender, { iterate, forceRender } from 'friends/async-render';

// Import `iterate` and `forceRender` methods
AsyncRender.addToPrototype(iterate, forceRender);

@component()
export default class bExample extends iBlock {}
```

Or, if you're using the module with Snakeskin helpers, all dependencies will be installed automatically.

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

The class brings a new method to create iterable objects: `asyncRender.iterate` that should be used with the `v-for` directive.
Don't forget to declare where to mount dynamically rendered fragments.
To do it, place your code within another node that marked by the `v-async-target` directive.

```
< .container v-async-target
  /// The first ten elements are rendered synchronously.
  /// After that, the rest elements will be split into chunks by ten elements and rendered asynchronously.
  /// The rendering of async fragments does not force re-rendering of the main component template.
  < .&__item v-for = el in asyncRender.iterate(myData, 10)
    {{ el }}
```

As we see in the example, `iterate` splits iteration into separated chunks.
Basically, the first chunk is rendered immediate, but the rest - asynchronously.

Using the second parameter, we can manage how many fragments can be placed within one render chunk (by default, the chunk size is equal to one).
Also, it is possible to skip several elements from the start. To do it, provide the second parameter as a tuple,
where the first parameter is a number to skip, the second one is a render chunk size.

```
< .container v-async-target
  /// Skip the first fifteen elements and render by three elements per chunk
  < .&__item  v-for = el in asyncRender.iterate(myData, [15, 3])
    {{ el }}
```

The parameter to iterate can be any iterable JS value, like arrays, maps, or sets.

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

Any string values are iterated by graphemes or letters, but not Unicode symbols.

```
< .container v-async-target
  /// 1, 😃, à, 🇷🇺, 👩🏽‍❤️‍💋‍👨
  < .&__item v-for = letter in asyncRender.iterate('1😃à🇷🇺👩🏽‍❤️‍💋‍👨')
    {{ letter }}
```

Any iterable element can be a promise. In that case, it will be rendered after resolving.

```
< .container v-async-target
  < .&__item v-for = user in asyncRender.iterate([fetch('/user/1'), fetch('/user/2')])
    {{ user }}
```

Or, we can use asynchronous iterable structures.

```
< .container v-async-target
  < .&__item v-for = user in asyncRender.iterate(asyncEventStream)
    {{ user }}
```

In addition to elements with promises or asynchronous iterable structures,
`asyncRender.iterate` can take a promise that returns a valid value to iterate.

```
< .container v-async-target
  < .&__item v-for = user in asyncRender.iterate(fetch('/users'))
    {{ user }}
```

Also, the method supports iterating over JS objects.

```
< .container v-async-target
  /// To iterate objects is used `Object.entries`
  < .&__item v-for = [key, value] in asyncRender.iterate({a: 1, b: 2})
    {{ key }} = {{ value }}
```

Finally, the method can create ranges and iterate through them if provided a value as a number.

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

`null` and `undefined` are cast to the empty iterator. It is useful when you provide a promise to iterate that can return a nullish value.

```
< .container v-async-target
  < .&__item v-for = el in asyncRender.iterate(null)
    {{ i }}

< .container v-async-target
  /// It's ok if `fetch` returns `null`
  < .&__item v-for = el in asyncRender.iterate(fetch('/users'))
    {{ i }}
```

The rest primitive types are cast to a single-element iterator.

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

## Additional options of iterations

As you have already known, you can specify a chunk size to render as the second parameter of `asyncRender.iterate`.
If the passed value to iterate not a promise, asynchronous iterable structure, or not contains promises as elements,
the first chunk can be rendered synchronously. Also, the iteration method can take an object with additional options to iterate.

### [weight = `1`]

The weight of one render chunk.
At the same tick can be rendered chunks with the accumulated weight no more than the `TASKS_PER_TICK` constant.
See `core/component/render/daemon` for more information.

### [useRaf = `false`]

If true, then all rendered fragments are inserted into the DOM by using a `requestAnimationFrame` callback.
This can optimize the browser rendering process.

### [group]

A group name to manual clearing of pending tasks via the `async` module.
Providing this value disables automatically cleanup of render tasks on the `update` hook.

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

A function to filter elements to render.
If it returns a promise, the rendering process will wait for the promise to resolve.
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

The destructor of a rendered fragment.
It will be called before each asynchronously rendered fragment is removed from the DOM.
If the function returns true, the internal destructor of the `asyncRender` module won’t be called.

## Methods

### forceRender

Restarts the `asyncRender` daemon to force rendering of async chunks.
See `core/component/render/daemon` for more information.

### deferForceRender

Creates a task to restart the `asyncRender` daemon on the next tick.
See `core/component/render/daemon` for more information.

### waitForceRender

A factory to create filters for `AsyncRender`, it returns a new function.
The new function can return a boolean or promise. If the function returns a promise, it will be resolved after firing a `forceRender` event.

The main function can take an element name as the first parameter.
This element will be dropped before resolving the resulting promise.

Notice, the initial component rendering is mean the same as `forceRender`.
This function is useful to re-render a functional component without touching the parent state.

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
It returns a list of element to the first synchronous render.
This function helps optimize component rendering by splitting big render tasks into smaller ones.

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

#### Enabling one time rendering

Providing the `renderKey` option you declare this template fragment should be rendered once,
i.e. it won’t be re-rendered during the component state change. Mind, the render key should be unique.

```
< .container v-async-target
  += self.render({renderKey: 'Login Form'})
    < b-button
      Login
```

#### Conditional rendering

If you want render the fragment only after some event, provide the `wait` option.
This option expects a string expression (cause it code-generation) with a function that returns a promise.

```
< .container v-async-target
  += self.render({wait: 'promisifyOnce.bind(null, "forceRender")'})
    < b-button
      Press on me!

    < b-input :placeholder = 'Enter your name'

< button @click = emit('forceRender')
  Show form
```
