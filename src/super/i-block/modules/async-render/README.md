# super/i-block/modules/async-render

This module provides a class to render chunks of a component template asynchronously.
It helps to optimize component' rendering.

## How does it work?

The class brings a new method to create iterable objects: `asyncRender.iterate`.
This method should be used with the `v-for` directive.

```
// The first ten elements are rendered synchronously.
// After that, the rest elements will be split into chunks by ten elements and rendered asynchronously.
// The rendering of async chunks does not force re-rendering of the main component template.
< .bla v-for = el in asyncRender.iterate(myData, 10)
  {{ el }}
```

As we see in the example, `iterate` splits iteration into separated chunks.
Basically, the first chunk is rendered immediate, but the rest - asynchronously.

Using the second parameter, we can manage how many items should be contained per one render chunk (by default, the chunk size is equal to one).
Also, it is possible to skip a number of elements from the start. To do it, provide the second parameter as a tuple,
where the first parameter is a number to skip, the second one is a render chunk' size.

```
/// Skip the first fifteen elements and render by three elements per chunk
< .bla v-for = el in asyncRender.iterate(myData, [15, 3])
  {{ el }}
```

The parameter to iterate can be defined as any valid iterable JavaScript value, like arrays, maps, or sets.

```
< .bla v-for = el in asyncRender.iterate([1, 2, 3])
  {{ el }}

< .bla v-for = el in asyncRender.iterate(new Set([1, 2, 3]))
  {{ el }}

/// All JS iterators are iterable objects
< .bla v-for = el in asyncRender.iterate(new Map([['a', 1], ['b', 2]]).entries())
  {{ el }}
```

The string values are iterated by graphemes or letters, but not Unicode symbols.

```
/// 1, 😃, à, 🇷🇺, 👩🏽‍❤️‍💋‍👨
< .bla v-for = letter in asyncRender.iterate('1😃à🇷🇺👩🏽‍❤️‍💋‍👨')
  {{ letter }}
```

Any iterable element can return a promise. In that case, it will be rendered after resolving.

```
< .bla v-for = user in asyncRender.iterate([fetch('/user/1'), fetch('/user/2')])
  {{ user }}
```

In addition to elements with promises, `asyncRender.iterate` can take a promise that returns a valid value to iterate.

```
< .bla v-for = user in asyncRender.iterate(fetch('/users'))
  {{ user }}
```

Also, the method supports iterating over JS object (without prototype' values).

```
// To iterate objects is used `Object.entries`
< .bla v-for = [key, value] in asyncRender.iterate({a: 1, b: 2})
  {{ key }} = {{ value }}
```

Finally, the method can create ranges and iterate through them if provided a value as a number.

```
< .bla v-for = i in asyncRender.iterate(10)
  {{ i }}

/// `true` is an alias for `Infinity`
< .bla v-for = i in asyncRender.iterate(true)
  {{ i }}

/// `false` is an alias for `-Infinity`
< .bla v-for = i in asyncRender.iterate(false)
  {{ i }}
```

`null` and `undefined` are cast to an empty iterator. It is useful when you provide a promise to iterate that can return a null value.

```
< .bla v-for = el in asyncRender.iterate(null)
  {{ i }}

/// It's ok if `fetch` returns `null`
< .bla v-for = el in asyncRender.iterate(fetch('/users'))
  {{ i }}
```

The rest primitive types are cast to a single-element iterator.

```
< .bla v-for = el in asyncRender.iterate(Symbol('foo'))
  {{ el }}
```

## Events

| EventName                  | Description                                              | Payload description | Payload                 |
|----------------------------|----------------------------------------------------------|---------------------|-------------------------|
| `asyncRenderChunkComplete` | One async chunk has been rendered                        | Task description    | `TaskParams & TaskDesc` |
| `asyncRenderComplete`      | All async chunks from one render task have been rendered | Task description    | `TaskParams & TaskDesc` |

## Additional parameters of iterations

As you have already known, you can specify a chunk' size to render as the second parameter of `asyncRender.iterate`.
If the passes value to iterate not a promise or not contains promises as elements, the first chunk can be rendered synchronously.
Also, the iteration method can take an object with additional parameters to iterate.

### [useRaf = `false`]

If true, then rendered chunks are inserted into DOM on the `requestAnimationFrame` callback.
It may optimize the process of browser rendering.

### [group]

A group name to manual clearing of pending tasks via `async`.
Providing this value disables automatically canceling of rendering task on the `update` hook.

```
/// Iterate over only even values
< .bla v-for = el in asyncRender.iterate(100, 10, {group: 'listRendering'})
  {{ el }}

/// Notice that we use RegExp to clear tasks.
/// Because each group has a group based on a template `asyncComponents:listRendering:${chunkIndex}`.
< button @click = async.clearAll({group: /:listRendering/})
  Cancel rendering
```

### [weight = `1`]

Weight of the one rendering chunk.
In the one tick can be rendered chunks with accumulated weight no more than 5.
See `core/render` for more information.

### [filter]

A function to filter elements to iterate. If it returns a promise, the rendering will wait for resolving.
If the promise' value is equal to `undefined`, it will cast to `true`.

```
/// Iterate over only even values
< .bla v-for = el in asyncRender.iterate(100, 5, {filter: (el) => el % 2 === 0})
  {{ el }}

/// Render each element only after the previous with the specified delay
< .bla v-for = el in asyncRender.iterate(100, {filter: (el) => async.sleep(100)})
  {{ el }}

/// Render a chunk on the specified event
< .bla v-for = el in asyncRender.iterate(100, 20, {filter: (el) => promisifyOnce('renderNextChunk')})
  {{ el }}

< button @click = emit('renderNextChunk')
  Render the next chunk
```

### [destructor]

The destructor of a rendered element.
It will be invoked before removing each async rendered element from DOM.

## Helpers

### forceRender

Restarts the async render daemon to force rendering.

### deferForceRender

Restarts the `asyncRender` daemon to force rendering (runs on the next tick).

### waitForceRender

Returns a function that returns a promise that will be resolved after firing the `forceRender` event.
The method can take an element name as the first parameter. This element will be dropped before resolving.

Notice, the initial rendering of a component is mean the same as `forceRender`.
The method is useful to re-render a non-regular component (functional or flyweight) without touching the parent state.

```
< button @click = asyncRender.forceRender()
 Re-render the component

< .&__wrapper
  < template v-for = el in asyncRender.iterate(true, { &
    filter: asyncRender.waitForceRender('content')
  }) .
    < .&__content
      {{ Math.random() }}

< .&__wrapper
  < template v-for = el in asyncRender.iterate(true, { &
    filter: asyncRender.waitForceRender((ctx) => ctx.$el.querySelector('.foo'))
  }) .
    < .foo
      {{ Math.random() }}
```

## Snakeskin helpers

### loadModules

Loads modules by the specified paths and dynamically inserted the provided content when it loaded.

```
+= self.loadModules('form/b-button')
  < b-button
    Hello world

/// `renderKey` is necessary to prevent any chunk' re-rendering after the first rendering of a template
/// `wait` is a function to defer the process of loading, it should return a promise with a non-false value
+= self.loadModules(['form/b-button', 'form/b-input'], {renderKey: 'controls', wait: 'promisifyOnce.bind(null, "needLoad")'})
  < b-button
    Hello world

  < b-input

< button @click = emit('needLoad')
  Force load
```
