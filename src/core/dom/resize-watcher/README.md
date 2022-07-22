# core/dom/resize-watcher

This module provides an API for more convenient work with [ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver).
Keep in mind that this module does not contain any polyfills and relies on the native support of the ResizeObserver API.

```js
import * as ResizeWatcher from 'core/dom/resize-watcher';

ResizeWatcher.watch(document.body, (newGeometry, oldGeometry, watcher) => {
  console.log('The element has been resized', newGeometry, oldGeometry);
});
```

## Why is this module needed?

Often when working with ResizeObserver we just want to register some kind of handler on an element.
However, the native API is based on classes, so we first have to create an instance of the class,
pass the handler to it, and then register the element.

```js
const observer1 = new ResizeObserver(handler1);
observer1.observe(document.body);

const observer2 = new ResizeObserver(handler2);
observer2.observe(document.body);
```

This module allows you to do it more gracefully.

```js
import * as ResizeWatcher from 'core/dom/resize-watcher';

ResizeWatcher.watch(document.body, handler1);
ResizeWatcher.watch(document.body, handler2);
```

In addition, this module provides a number of useful options.
And all adjacent resize events are collapsed into one by default, which helps avoid application performance issues.

```js
import * as ResizeWatcher from 'core/dom/resize-watcher';

ResizeWatcher.watch(document.body, {once: true, box: 'border-box'}, handler);
```

## Functions

### watch

Watches for the geometry of the passed element and invokes the specified handler when it changes.
Note, changes occurring in the same tick are merged into one. You can disable this behavior by passing the `immediate: true` option.

```js
import * as ResizeWatcher from 'core/dom/resize-watcher';

ResizeWatcher.watch(document.body, {immediate: true}, (newGeometry, oldGeometry, watcher) => {
  console.log('The element has been resized', newGeometry, oldGeometry);
});
```

The function returns a special watcher object that can be used to cancel the watching.

```js
import * as ResizeWatcher from 'core/dom/resize-watcher';

const watcher = ResizeWatcher.watch(document.body, (newGeometry, oldGeometry, watcher) => {
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

ResizeWatcher.watch(document.body, {box: 'border-box'}, console.log);
```

##### [watchWidth = `true`]

If false, then the handler won't be called when only the width of the observed element changes.

```js
import * as resizeWatcher from 'core/dom/resize-watcher';

resizeWatcher.watch(document.body, {watchWidth: false}, (newGeometry, oldGeometry) => {
  console.log('The element height has been changed', newGeometry, oldGeometry);
});
```

##### [watchHeight = `true`]

If false, then the handler won't be called when only the height of the observed element changes.

```js
import * as resizeWatcher from 'core/dom/resize-watcher';

resizeWatcher.watch(document.body, {watchHeight: false}, (newGeometry, oldGeometry) => {
  console.log('The element width has been changed', newGeometry, oldGeometry);
});
```

##### [watchInit = `true`]

If true, then the handler will be called immediately after the initialization of [ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver).

```js
import * as resizeWatcher from 'core/dom/resize-watcher';

resizeWatcher.watch(document.body, {watchInit: false}, console.log);
```

##### [immediate = `false`]

If true, then the handler will be called immediately when the size of the observed element changes.
Be careful using this option as it can degrade application performance.

```js
import * as ResizeWatcher from 'core/dom/resize-watcher';

ResizeWatcher.watch(document.body, {immediate: true}, console.log);
```

##### [once = `false`]

If true, then after the first handler firing, the observation of the element will be canceled.
Note that the handler firing caused by the `watchInit` option is ignored.

```js
import * as ResizeWatcher from 'core/dom/resize-watcher';

ResizeWatcher.watch(document.body, {once: true}, (newGeometry, oldGeometry, watcher) => {
  console.log('The element has been resized', newGeometry, oldGeometry);
});
```

### unwatch

Cancels watching for the specified element geometry.
If you pass a handler, then only it will be cancelled.

```js
import * as ResizeWatcher from 'core/dom/resize-watcher';

ResizeWatcher.watch(document.body, handler1);
ResizeWatcher.watch(document.body, handler2);

// Cancel only `handler2` from `document.body`
ResizeWatcher.unwatch(document.body, handler2);

// Cancel all handlers from `document.body`
ResizeWatcher.unwatch(document.body);
```
