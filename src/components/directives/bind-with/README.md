# components/directives/bind-with

This module provides a directive that links a component's template element to a specific property or event.
The binding process is executed using the provided handler function,
which receives a reference to the element the directive is applied to as its first argument.

```
- namespace [%fileName%]

- include 'components/super/i-block'|b as placeholder

- template index() extends ['i-block'].index
  - block body
    < input v-bind-with = { &
      path: 'value',
      then: (input, value) => input.value = value
    } .
```

## Why is This Directive Needed?

When using regular components, we don't have to think about how the data used in the template is tied to
the component's properties.
This job is handled for us by Vue or other engines that we use.
On the other hand, we have functional components which, by contract, render only once,
and no property changes can cause their re-rendering.
Typically, this doesn't pose any problems, as if a component requires reactivity,
it should simply be used as a regular Vue component, while functional components are optimized for simpler components
that don't need reactivity.
However, there are situations where using regular components is too excessive,
and the required template fragment update is simple enough to be implemented directly in the code.
This directive comes in handy in these cases:
it essentially allows you to bind to an event or property with a template element
and specify a function to be called when the event fires.
In this function, for instance, we can modify the node value or even change its descendants.

## How to include this directive?

Just add the directive import in your component code.

```js
import 'components/directives/bind-with';

import iBlock, { component } from 'components/super/i-block/i-block';

@component()
class bExample extends iBlock {}
```

## Usage

### Binding to a property

We can observe changes to any component's property and bind a handler to these alterations.
Change tracking is accomplished through the component's standard `watch` API.
We are able to pass additional parameters when adding the handler.

```
< div v-bind-with = { &
  path: 'bla.bar',
  then: (el, value, oldValue, info) => myHandler(el, value, oldValue, info)
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

We can attach a handler with a specific component event or an event from a passed event emitter.

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

If the event emitter is capable of accepting additional parameters, we can pass them along when attaching the handler.

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

We can tie the execution of a handler with the resolution of a promise.
Moreover, we can pass multiple handlers simultaneously for the fulfilled and rejected states.

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

Finally, we can provide the handler as a callback to another function.

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

If the element is bound to more than one event, the directive can accept an array of such configurations.

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

All bindings are additionally proxied through a component's instance of [[Async]],
allowing for the transmission of extra proxying parameters.

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

## Helpers

The directive exports a bunch of helpers that can be utilized in other directives.

### getElementId

Returns a unique identifier for the directive associated with the given element.

### clearElementBindings

Clears all declared bindings for the passed element.

### bindListenerToElement

Binds the specified listener(s) to the passed element.
