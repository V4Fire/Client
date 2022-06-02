# core/component/directives/update-on

This module provides a directive to manually update an element using various event(s) from multiple emitters.
Use this directive if you want to update some fragments of your template without re-rendering of the whole template or
with functional components.

## Usage

1. Simple event listener.

```
< div v-update-on = { &
  emitter: parentEmitter,
  event: 'foo',
  handler: (el, event) => myHandler(el, event)
} .
```

2. Listening to a one-time event.

```
< div v-update-on = { &
  emitter: parentEmitter,
  single: true,
  event: 'foo',
  handler: myHandler
} .
```

3. Providing extra options to the emitter.

```
< div v-update-on = { &
  emitter: document,
  event: 'touchmove',
  handler: myHandler,
  options: {
    passive: true
  }
} .
```

4. Multiple event listeners.

```
< div v-update-on = [ &
  {
    emitter: parentEmitter,
    event: ['foo', 'baz'],
    handler: myHandler
  },

  {
    emitter: globalEmitter,
    event: 'bar',
    single: true
    handler: myHandler
  }
] .
```

4. Handling of a promise.

```
< div v-update-on = { &
  emitter: somePromiseValue,
  handler: myHandler,
  errorHandler: myErrorHandler
} .
```

4. Watching for a component property.

```
< div v-update-on = { &
  emitter: 'bla.bar',
  handler: myHandler,
  options: {deep: true}
} .
```

5. Providing an async group prefix.

```
< div v-update-on = { &
  emitter: 'bla.bar',
  handler: myHandler,
  options: {deep: true},
  group: 'myWatcher'
} .
```

```js
this.async.clearAll({group: /myWatcher/});
```
