# core/dom

This module provides a bunch of helper functions to work with DOM objects.

## Submodules

* `intersection-watcher` - this module provides an API to track elements entering or leaving the viewport;
* `resize-watcher` - this module provides an API for more convenient work with [ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver).

## Functions

### wrapAsDelegateHandler

Wraps the specified function as an event handler with delegation.
In simple terms, the wrapped function will be executed only if the event happened on the element by the given
selector or in its descendant node.
Also, the function adds to the event object a reference to the element to which the selector is specified.

```js
import { wrapAsDelegateHandler } from 'core/dom';

document.addEventListener('click', wrapAsDelegateHandler('.bla', (e) => {
  console.log(e);
}));

// Or we can use this function as a decorator

class Foo {
  @wrapAsDelegateHandler('h1')
  onH1Click(e) {
    console.log('Boom!');
    console.log(e.delegateTarget);
  }
}
```
