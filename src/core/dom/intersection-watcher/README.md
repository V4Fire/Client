# core/dom/intersection-watcher

This module provides an API to track elements entering or leaving the viewport.
The module supports several element tracking strategies.

The default strategy used is the [IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API).
However, if the current environment does not support the Intersection Observer API,
then the module falls back to a different strategy.
This fallback strategy is based on using the elements' heightmap
and the [MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver).

## Why is This Module Needed?

Often when working with IntersectionObserver, we simply want to register a handler on an element.
However, the native API is based on classes, so we first need to create an instance of the class,
pass the handler to it, and then register the element.

```js
const observer1 = new IntersectionObserver(handler1);
observer1.observe(document.getElementById('my-elem'));

const observer2 = new IntersectionObserver(handler2, {threshold: 0.5});
observer2.observe(document.getElementById('my-elem'));
```

This module provides a more elegant way to achieve that.

```js
import * as IntersectionWatcher from 'core/dom/intersection-watcher';

IntersectionWatcher.watch(document.getElementById('my-elem'), handler1);
IntersectionWatcher.watch(document.getElementById('my-elem'), {threshold: 0.5}, handler2);
```

All registered handlers that have the same observation parameters will share the same IntersectionObserver instance.
This optimization helps improve performance.
Additionally, this module offers several useful additional options.
For instance, you can add handlers for when an element appears or disappears.
If the browser environment does not support IntersectionObserver,
an alternative observation strategy based on the element's heightmap will be used.

```js
import * as IntersectionWatcher from 'core/dom/intersection-watcher';

IntersectionWatcher.watch(document.getElementById('my-elem'), {onEnter: console.log, onLeave: console.log, delay: 1500}, handler);
```

Alternatively, you can use this module in a similar way to the original IntersectionObserver
by creating your own watcher instance.
With this approach, you can cancel all registered handlers at once within a single instance.
It's important to note that each instance has its own IntersectionObserver instances,
providing more flexibility in managing the handlers.

```js
import IntersectionWatcher from 'core/dom/intersection-watcher';

const intersectionWatcher = new IntersectionWatcher();

intersectionWatcher.watch(document.getElementById('my-elem'), {threshold: 0.5, delay: 1500}, handler1);
intersectionWatcher.watch(document.getElementById('my-elem'), handler2);

// Cancel the all registered handlers
intersectionWatcher.unwatch();

// Cancel the all registered handlers and prevent new ones
intersectionWatcher.destroy();
```

## API

### watch

Tracks the intersection of the passed element with the viewport,
and invokes the specified handler each time the element enters the viewport.

```js
import * as IntersectionWatcher from 'core/dom/intersection-watcher';

IntersectionWatcher.watch(document.getElementById('my-elem'), {delay: 1500}, (watcher) => {
  console.log('The element has entered the viewport', watcher.target);
});
```

The function returns a watcher object that can be used to cancel the watching.

```js
import * as IntersectionWatcher from 'core/dom/intersection-watcher';

const watcher = IntersectionWatcher.watch(document.getElementById('my-elem'), {delay: 1500}, (watcher) => {
  console.log('The element has entered the viewport', watcher.target);
});

watcher.unwatch();
```

#### Additional options

##### [root]

An element whose bounds are treated as the bounding box of the viewport for the element which is the observer target.
This option can also be given as a function that returns the root element.

Note, when using a heightmap-based watching strategy,
this element will be used to calculate the geometry of the observed elements.
See [this](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/root) for more information.

##### [onlyRoot = `true`]

This option only affects the heightmap-based watching strategy and when the `root` option is passed.
If set to false, registered event handlers will be called for every scroll event,
including those not related to the root element.

##### [rootMargin]

A string, formatted similarly to the CSS margin property's value,
which contains offsets for one or more sides of the root's bounding box.
These offsets are added to the corresponding values in the root's bounding box
before the intersection between the resulting rectangle and the target element's bounds.
See also [this](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/rootMargin) for more information.

Note: [it works only for the `IntersectionObserver` strategy](https://github.com/V4Fire/Client/issues/1244).

##### [threshold = `0`]

A number which indicate at what percentage of the observable element visibility the intersection callback
should be executed. If you only want to detect when visibility passes the 50% mark, you can use a value of `0.5`.

The default is `0` (meaning as soon as even one pixel is visible, the handler will be run).
A value of `1.0 `means that the threshold isn't considered passed until every pixel is visible.

```js
import * as IntersectionWatcher from 'core/dom/intersection-watcher';

IntersectionWatcher.watch(document.getElementById('my-elem'), {threshold: 0.5}, (watcher) => {
  console.log('The element has entered the viewport', watcher.target);
});
```

##### [delay = `0`]

The minimum delay, in milliseconds, before calling the intersection handler.
If the observable element leaves the viewport before this delay elapses,
the intersection handler will not be called.

```js
import * as IntersectionWatcher from 'core/dom/intersection-watcher';

IntersectionWatcher.watch(document.getElementById('my-elem'), {delay: 1500}, (watcher) => {
  console.log('The element has entered the viewport', watcher.target);
});
```

##### [once = `false`]

If set to true, then after the first intersection handler is called, the observation will be canceled

```js
import * as IntersectionWatcher from 'core/dom/intersection-watcher';

IntersectionWatcher.watch(document.getElementById('my-elem'), {once: true}, (watcher) => {
  console.log('The element has entered the viewport', watcher.target);
});
```

##### [trackVisibility = `false`]

A boolean indicating whether the watcher will track changes in the element visibility.
This option is only meaningful for environments that support the native IntersectionObserver2 API.
See [this](https://web.dev/intersectionobserver-v2) for more information.

Mind, compute of visibility is more expensive than intersection.
For that reason, IntersectionObserver2 is not intended to be used broadly in the way that IntersectionObserver1 is.
IntersectionObserver2 is focused on combating fraud and should be used only when IntersectionObserver1
functionality is truly insufficient.

##### [onEnter]

Handler: the observable element has entered the viewport.
If the handler function returns false, the main watcher handler will not be called.
It's important to note that this handler is always called immediately,
meaning it ignores the delay option specified.

```js
import * as IntersectionWatcher from 'core/dom/intersection-watcher';

IntersectionWatcher.watch(document.getElementById('my-elem'), {delay: 1500, onEnter}, (watcher) => {
  console.log('The element has entered the viewport', watcher.target);
});

function onEnter(watcher) {
  return watcher.target.classList.contains('active');
}
```

##### [onLeave]

Handler: the observable element has left the viewport.
It's important to note that this handler is always called immediately,
meaning it ignores the delay option specified.


```js
import * as IntersectionWatcher from 'core/dom/intersection-watcher';

IntersectionWatcher.watch(document.getElementById('my-elem'), {delay: 1500, onLeave}, (watcher) => {
  console.log('The element has entered the viewport', watcher.target);
});

function onLeave(watcher) {
  console.log('The element has leaved the viewport');
}
```

#### Watcher object

The `watch` method returns a special watcher object with a set of useful properties and methods.

```typescript
interface Watcher extends Readonly<WatchOptions> {
  /**
   * The unique watcher identifier
   */
  readonly id: string;

  /**
   * The observed element
   */
  readonly target: Element;

  /**
   * A function that will be called when the element enters the viewport
   */
  readonly handler: WatchHandler;

  /**
   * The observable target size
   */
  readonly size: ElementSize;

  /**
   * True if the observable target has left the viewport
   */
  readonly isLeaving: boolean;

  /**
   * The time the observed target entered the viewport relative to the time at which the document was created
   */
  readonly timeIn?: DOMHighResTimeStamp;

  /**
   * The time the observed target left the viewport relative to the time at which the document was created
   */
  readonly timeOut?: DOMHighResTimeStamp;

  /**
   * The time at which the observable target element experienced the intersection change.
   * The time is specified in milliseconds since the creation of the containing document.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserverEntry/time
   */
  readonly time?: DOMHighResTimeStamp;

  /**
   * Cancels watching for the element intersection
   */
  unwatch(): void;
}
```

### unwatch

Cancels watching for the registered elements.

If the method takes an element, then only that element will be unwatched.
Additionally, you can filter the watchers to be canceled by specifying a handler or a threshold.

```js
import * as IntersectionWatcher from 'core/dom/intersection-watcher';

IntersectionWatcher.watch(document.getElementById('my-elem'), handler1);
IntersectionWatcher.watch(document.getElementById('my-elem'), {threshold: 0.5}, handler2);
IntersectionWatcher.watch(document.getElementById('my-elem'), {threshold: 0.5}, handler3);

// Cancel only `handler1` from the passed element
IntersectionWatcher.unwatch(document.getElementById('my-elem'), handler1);

// Cancel the all registered handlers with the `threshold = 0.5` from the passed element
IntersectionWatcher.unwatch(document.getElementById('my-elem'), 0.5);

// Cancel the all registered handlers from the passed element
IntersectionWatcher.unwatch(document.getElementById('my-elem'));

// Cancel the all registered handlers
IntersectionWatcher.unwatch();
```

## destroy

Cancels watching for all registered elements and destroys the instance.
This method is available only when you explicitly instantiate IntersectionWatcher.

```js
import IntersectionWatcher from 'core/dom/intersection-watcher';

const
  intersectionWatcher = new IntersectionWatcher();

intersectionWatcher.watch(document.getElementById('my-elem'), handler1);
intersectionWatcher.watch(document.getElementById('my-elem'), {threshold: 0.5}, handler2);

// Cancel the all registered handlers and prevent new ones
intersectionWatcher.destroy();
```
