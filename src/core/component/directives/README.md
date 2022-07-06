# core/component/directives

This module provides a bunch of built-in directives for working with components and nodes.

### How to include a directive?

Some directives are included automatically, while the rest must be imported explicitly.
Just add an import of the required directive in your component code.

```js
import 'core/component/directives/bind-with';

import iBlock, { component } from 'super/i-block/i-block';

@component()
class bExample extends iBlock {}
```

## Automatically included directives

* `core/component/directives/tag` - this module provides a directive to dynamically specify the tag name to create;
* `core/component/directives/ref` - this module provides a directive to create a ref to another component or element;
* `core/component/directives/hook` - this module provides a directive with which you can listen to any directive lifecycle hooks from a component;
* `core/component/directives/attrs` - this module provides a directive to set any input parameters to a component or tag based on the passed dictionary;
* `core/component/directives/async-target` - this module provides a directive to mark the element where should be appended dynamically render fragments.

## Optional directives

* `core/component/directives/bind-with` - this module provides a directive to bind a component template element to some property or event.
