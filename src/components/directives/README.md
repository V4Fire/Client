# core/component/directives

This module provides a bunch of built-in directives for working with components and nodes.

### How to include a directive?

Just add the import of the required directive in your component code.

```js
import 'components/directives/bind-with';

import iBlock, { component } from 'components/super/i-block/i-block';

@component()
class bExample extends iBlock {}
```

## Available directives

* `components/directives/bind-with` - this module provides a directive to bind a component template element to some property or event;
* `components/directives/on-resize` - this module provides a directive to watch element resizing;
* `components/directives/in-view` - this module provides a directive to track elements entering or leaving the viewport;
* `components/directives/image` - this module provides a directive to load and display images using `img` and/or `picture` tags;
* `components/directives/icon` - this module provides a directive to load and display SVG icons by their name from a sprite.
