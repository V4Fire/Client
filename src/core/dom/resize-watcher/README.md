# core/dom/resize-watcher

This module provides an API for more convenient work with [ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver).
Keep in mind that this module does not contain any polyfills and relies on the native support of the ResizeObserver API.

```js
import * as ResizeWatcher from 'core/dom/resize-watcher';

ResizeWatcher.watch(document.getElementById('my-elem'), (newGeometry, oldGeometry, watcher) => {
  console.log('The element has been resized', newGeometry, oldGeometry);
});
```

## Why is this module needed?

Often when working with `ResizeObserver` we just want to register some kind of handler on an element.
However, the native API is based on classes, so we first have to create an instance of the class,
pass the handler to it, and then register the element.

```js
const observer1 = new ResizeObserver(handler1);
observer1.observe(document.getElementById('my-elem'));

const observer2 = new ResizeObserver(handler2);
observer2.observe(document.getElementById('my-elem'));
```

This module allows you to do it more gracefully.

```js
import * as ResizeWatcher from 'core/dom/resize-watcher';

ResizeWatcher.watch(document.getElementById('my-elem'), handler1);
ResizeWatcher.watch(document.getElementById('my-elem'), handler2);
```

All registered handlers share the same ResizeObserver instance, which helps improve performance.
In addition, this module provides a number of useful options. And all adjacent resize events are collapsed into one by default,
which helps avoid application performance issues.

```js
import * as ResizeWatcher from 'core/dom/resize-watcher';

ResizeWatcher.watch(document.getElementById('my-elem'), {once: true, box: 'border-box'}, handler);
```

However, you can use this module just like the original ResizeObserver by creating your own watcher instance.
This approach allows you to cancel all registered handlers at once within a single instance.
Keep in mind, each instance has its own ResizeObserver instance.

```js
import ResizeWatcher from 'core/dom/resize-watcher';

const resizeWatcher = new ResizeWatcher();

resizeWatcher.watch(document.getElementById('my-elem'), {once: true, box: 'border-box'}, handler1);
resizeWatcher.watch(document.getElementById('my-elem'), handler2);

// Cancel the all registered handlers
resizeWatcher.unwatch();

// Cancel the all registered handlers and prevent new ones
resizeWatcher.destroy();
```

## API

### watch

Watches for the size of the given element and invokes the specified handler when it changes.
Note, changes occurring at the same tick are merged into one. You can disable this behavior by passing the `immediate: true` option.

```js
import * as ResizeWatcher from 'core/dom/resize-watcher';

ResizeWatcher.watch(document.getElementById('my-elem'), {immediate: true}, (newGeometry, oldGeometry, watcher) => {
  console.log('The element has been resized', newGeometry, oldGeometry);
});
```

The function returns a watcher object that can be used to cancel the watching.

```js
import * as ResizeWatcher from 'core/dom/resize-watcher';

const watcher = ResizeWatcher.watch(document.getElementById('my-elem'), (newGeometry, oldGeometry, watcher) => {
  console.log('The element has been resized', newGeometry, oldGeometry);
});

watcher.unwatch();
```

#### Additional options

##### [box = `'content-box'`]

This property allows you to change which box model is used to determine size changes.

1. The `content-box` option only includes the actual content of the element.
2. The `border-box` option takes into account things like border and padding changes.
3. The `device-pixel-content-box` option is similar to the `content-box` option, but it takes into account the
   actual pixel size of the device it is rendering too. This means that the `device-pixel-content-box` will change
   at a different rate than the `content-box` depending on the pixel density of the device.

```js
import * as ResizeWatcher from 'core/dom/resize-watcher';

ResizeWatcher.watch(document.getElementById('my-elem'), {box: 'border-box'}, console.log);
```

##### [watchWidth = `true`]

If false, then the handler won't be called when only the width of the observed element changes.

```js
import * as resizeWatcher from 'core/dom/resize-watcher';

resizeWatcher.watch(document.getElementById('my-elem'), {watchWidth: false}, (newGeometry, oldGeometry) => {
  console.log('The element height has been changed', newGeometry, oldGeometry);
});
```

##### [watchHeight = `true`]

If false, then the handler won't be called when only the height of the observed element changes.

```js
import * as resizeWatcher from 'core/dom/resize-watcher';

resizeWatcher.watch(document.getElementById('my-elem'), {watchHeight: false}, (newGeometry, oldGeometry) => {
  console.log('The element width has been changed', newGeometry, oldGeometry);
});
```

##### [watchInit = `true`]

If true, then the handler will be called after the first resizing.

```js
import * as resizeWatcher from 'core/dom/resize-watcher';

resizeWatcher.watch(document.getElementById('my-elem'), {watchInit: false}, console.log);
```

##### [immediate = `false`]

If true, then the handler will be called immediately when the size of the observed element changes.
Be careful using this option as it can degrade application performance.

```js
import * as ResizeWatcher from 'core/dom/resize-watcher';

ResizeWatcher.watch(document.getElementById('my-elem'), {immediate: true}, console.log);
```

##### [once = `false`]

If true, then after the first handler invoking, the observation of the element will be canceled.
Note that the handler firing caused by the `watchInit` option is ignored.

```js
import * as ResizeWatcher from 'core/dom/resize-watcher';

ResizeWatcher.watch(document.getElementById('my-elem'), {once: true}, (newGeometry, oldGeometry, watcher) => {
  console.log('The element has been resized', newGeometry, oldGeometry);
});
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
   * A function that will be called when the observable element is resized
   */
  readonly handler: WatchHandler;

  /**
   * The observable element geometry
   */
  readonly rect?: DOMRectReadOnly;

  /**
   * Cancels watching for the element geometry
   */
  unwatch(): void;
}
```

### unwatch

Cancels watching for the registered elements.

If the method takes an element, then only that element will be unwatched.
Additionally, you can filter the watchers to be canceled by specifying a handler.

```js
import * as ResizeWatcher from 'core/dom/resize-watcher';

ResizeWatcher.watch(document.getElementById('my-elem'), handler1);
ResizeWatcher.watch(document.getElementById('my-elem'), handler2);

// Cancel only `handler2` from the passed element
ResizeWatcher.unwatch(document.getElementById('my-elem'), handler2);

// Cancel the all registered handlers from the passed element
ResizeWatcher.unwatch(document.getElementById('my-elem'));

// Cancel the all registered handlers
ResizeWatcher.unwatch();
```

## destroy

Cancels watching for the all registered elements and destroys the instance.
This method is available only when you explicitly instantiate ResizeWatcher.

```js
import ResizeWatcher from 'core/dom/resize-watcher';

const
  resizeWatcher = new ResizeWatcher();

resizeWatcher.watch(document.getElementById('my-elem'), {once: true, box: 'border-box'}, handler1);
resizeWatcher.watch(document.getElementById('my-elem'), handler2);

// Cancel the all registered handlers and prevent new ones
resizeWatcher.destroy();
```
