# core/event

This module extends the [core/event](https://v4fire.github.io/Core/modules/src_core_event_index.html) module from and adds a bunch of methods for browser-specific tasks.

## resolveAfterDOMLoaded

Returns a promise that will be resolved after the `DOMContentLoaded` event.

```js
import { resolveAfterDOMLoaded } from 'core/event';

resolveAfterDOMLoaded().then(() => {
  console.log('Boom!');
});
```
