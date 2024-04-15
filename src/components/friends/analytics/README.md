# components/friends/analytics

This module provides a class to send component analytic events.
The module uses `core/analytics` with the default engine.

```js
this.analytics.send('clicked', {user: '1'});
```

## How to Include this Module in Your Component?

By default, any component that inherits from [[iBlock]] has the `analytics` property.
However, to use the module methods, attach them explicitly to enable tree-shake code optimizations.
Simply place the required import declaration within your component file.

```typescript
import iBlock, { component } from 'components/super/i-block/i-block';
import Analytics, { send } from 'components/friends/analytics';

// Import the `send` method
Analytics.addToPrototype({send});

@component()
export default class bExample extends iBlock {}
```

## Methods

### send

Sends a new analytic event with the specified details.
