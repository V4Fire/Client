# core/component/directives/bind-with

This module provides a directive to bind a component template element to some property or event.
Binding is carried out through the passed handler function, which will always take as the first parameter a link to
the element to which the directive is applied.

It is convenient to use this directive to describe the logic of point-by-point updating of template fragments without
forced re-rendering of the entire template. For example, you can use this directive with your functional components.

## How to include a directive?

Just add the directive import in your component code.

```js
import 'core/component/directives/bind-with';

import iBlock, { component } from 'super/i-block/i-block';

@component()
class bExample extends iBlock {}
```

## Usage

### Binding to a property

```
< div v-bind-with = { &
  path: 'bla.bar',
  then: (el, value, oldValue, info) => myHandler(el, value, oldValue, info),
} .

< div v-bind-with = { &
  path: 'bla.bar',
  then: myHandler,
  options: {
    deep: true,
    flush: 'sync'
  }
} .
```

### Binding to an event

#### Binding to a component event

```
< div v-bind-with = { &
  on: 'myEvent',
  then: (el, eventData) => myHandler(el, eventData)
} .

< div v-bind-with = { &
  on: ['myEvent', 'anotherEvent'],
  then: myHandler
} .

< div v-bind-with = { &
  on: 'anotherEvent',
  then: myHandler
} .
```

#### Binding to an event of the passed emitter

```
< div v-bind-with = { &
  emitter: parentEmitter,
  on: 'myEvent',
  then: (el, eventData) => myHandler(el, eventData)
} .

< div v-bind-with = { &
  emitter: parentEmitter,
  on: ['myEvent', 'anotherEvent'],
  then: myHandler
} .

< div v-bind-with = { &
  emitter: parentEmitter,
  once: 'anotherEvent',
  then: myHandler
} .
```

#### Providing extra options to the emitter

```
< div v-bind-with = { &
  emitter: document,
  on: 'touchmove',
  then: myHandler,
  options: {
    passive: true,
    capture: true
  }
} .
```

### Binding to a promise

```
< div v-bind-with = { &
  promise: myPromiseValue,
  then: myHandler
} .

< div v-bind-with = { &
  promise: myPromiseValue,
  then: myHandler,
  catch: myErrorHandler
} .

< div v-bind-with = { &
  promise: fetch.bind(null, 'https://data.com/get-users'),
  then: myHandler,
  catch: myErrorHandler
} .
```

### Binding to a callback

```
< div v-bind-with = { &
  callback: (handler) => document.addEventListener('click', handler),
  then: myHandler
} .

< div v-bind-with = { &
  callback: (handler, errorHandler) => db.query('SELECT * FROM users', handler, errorHandler),
  then: myHandler,
  catch: myErrorHandler
} .
```

### Providing multiple bindings to the same element

```
< div v-bind-with = [ &
  {
    emitter: parentEmitter,
    on: ['myEvent', 'anotherEvent'],
    then: myHandler
  },

  {
    path: 'bla.bar',
    then: myHandler,
  }
] .
```

### Providing an Async group prefix

```
< div v-bind-with = { &
  path: 'bla.bar',
  group: 'myWatcher',
  then: myHandler
} .
```

```js
this.async.clearAll({group: /myWatcher/});
```

## Functions

### getElementId

Returns the unique directive identifier for the passed element.

### clearElementBindings

Clears all declared bindings for the passed element.

### bindListenerToElement

Binds the specified listener(s) to the passed element.
