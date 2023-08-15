# core/dom/intersection-watcher

This module provides an API to track elements entering or leaving the viewport.
The module supports several element tracking strategies.
The default is [IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API),
but if the environment does not support it,
then a strategy based on the elements heightmap and MutationObserver will be used.

## Why is this module needed?

Often when working with `IntersectionObserver` we just want to register some kind of handler on an element.
However, the native API is based on classes, so we first have to create an instance of the class,
pass the handler to it, and then register the element.

```js
const observer1 = new IntersectionObserver(handler1);
observer1.observe(document.getElementById('my-elem'));

const observer2 = new IntersectionObserver(handler2, {threshold: 0.5});
observer2.observe(document.getElementById('my-elem'));
```

This module allows you to do it more gracefully.

```js
import * as IntersectionWatcher from 'core/dom/intersection-watcher';

IntersectionWatcher.watch(document.getElementById('my-elem'), handler1);
IntersectionWatcher.watch(document.getElementById('my-elem'), {threshold: 0.5}, handler2);
```

All registered handlers with the same watching parameters share the same IntersectionObserver instance, which helps improve performance.
In addition, this module provides a number of useful additional options. For example, you can add handlers for the appearance or
disappearance of an element. If the environment does not support IntersectionObserver, then an alternative observation
strategy based on the elements heightmap is used.

```js
import * as IntersectionWatcher from 'core/dom/intersection-watcher';

IntersectionWatcher.watch(document.getElementById('my-elem'), {onEnter: console.log, onLeave: console.log, delay: 1500}, handler);
```

However, you can use this module just like the original IntersectionObserver by creating your own watcher instance.
This approach allows you to cancel all registered handlers at once within a single instance.
Keep in mind, each instance has its own IntersectionObserver instances.

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

Tracks the intersection of the passed element with the viewport, and invokes the specified handler each time the element enters the viewport.

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

Note, when using a heightmap-based watching strategy, this element will be used to calculate the geometry of the observed elements.
See [this](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/root) for more information.

##### [onlyRoot = `true`]

This option only affects the heightmap-based watching strategy and when the `root` option is passed.
If false, then registered handlers will be called for any scroll event, not just root events.

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

The minimum delay in milliseconds before calling the intersection handler.
If after this delay the observable element leaves the viewport, then the intersection handler won't be called.

```js
import * as IntersectionWatcher from 'core/dom/intersection-watcher';

IntersectionWatcher.watch(document.getElementById('my-elem'), {delay: 1500}, (watcher) => {
  console.log('The element has entered the viewport', watcher.target);
});
```

##### [once = `false`]

If true, then after the first intersection handler firing, the observation will be canceled.

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
If the handler returns false, then the main watcher handler won't be called.
Note that this handler is always called immediately, i.e., ignores the `delay` option.

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

Handler: the observable element has leaved the viewport.
Note that this handler is always called immediately, i.e., ignores the `delay` option.

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

Cancels watching for the all registered elements and destroys the instance.
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
