# super/i-block/modules/async-render

This module provides a class to render chunks of a component template asynchronously.
It helps to optimize component' rendering.

## How does it work?

The class brings a new method to create iterable objects: `asyncRender.iterate`.
This method should be used with the `v-for` directive.

```
// The first ten elements are rendered synchronously.
// After that, the rest elements will be split into chunks by ten elements and rendered asynchronously.
// The rendering of async chunks doesn't force re-rendering of the main component template.
< .bla v-for = el in asyncRender.iterate(myData, 10)
  {{ el }}
```

As we see in the example, `iterate` splits iteration into separated chunks.
Basically, the first chunk is rendered immediate, but the rest - asynchronously.
The chunk' size can be defined with the second parameter of the iteration method (by default, the chunk size is equal to one).

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

## Additional parameters of iterations

As you have already known,  you can specify a chunk' size to render as the second parameter of `asyncRender.iterate`.
If the passes value to iterate not a promise or not contains promises as elements, the first chunk can be rendered synchronously.
Also, the iteration method can take an object with additional parameters to iterate.

```
/// Iterate over only even values
< .bla v-for = el in asyncRender.iterate(100, 5, {filter: (el) => el % 2 === 0})
  {{ el }}
```
