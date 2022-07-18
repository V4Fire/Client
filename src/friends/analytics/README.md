# friends/analytics

This module provides a class for sending component analytic events.
The module uses `core/analytics` with the default engine.

```js
this.analytics.send('clicked', {user: '1'});
```

## How to include this module to your component?

By default, any component that inherited from [[iBlock]] has the `analytics` property.
But to use module methods, attach them explicitly to enable tree-shake code optimizations.
Just place the necessary import declaration within your component file.

```typescript
import iBlock, { component } from 'super/i-block/i-block';
import Analytics, { send } from 'friends/analytics';

// Import the `send` method
Analytics.addToPrototype(send);

@component()
export default class bExample extends iBlock {}
```

## Methods

### send

Sends a new analytic event with the specified details.
