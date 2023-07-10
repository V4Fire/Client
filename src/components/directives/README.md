# core/component/directives

This module provides a bunch of directives designed for interacting with components and nodes.

## How to include any directive?

Just add the import of the required directive in your component code.

```js
import 'components/directives/bind-with';

import iBlock, { component } from 'components/super/i-block/i-block';

@component()
class bExample extends iBlock {}
```

## Available directives

The following modules are available in the `components/directives` folder.

* `bind-with` - this module provides a directive that binds a component template element to a property or event.
* `on-resize` - this module provides a directive that watches element resizing.
* `in-view` - this module provides a directive that tracks elements entering or leaving the viewport.
* `image` - this module provides a directive that loads and displays images using `img` and/or `picture` tags.
* `icon` - this module provides a directive that loads and displays SVG icons by their name from a sprite.
