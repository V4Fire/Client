# core/data/middlewares/hydration-cache

This module provides middleware that enables the use of data from the hydration store in a cache.
It uses the [core/cache/decorators/hydration](../../../cache/decorators/hydration/README.md) module to achieve this.

## Usage

```typescript
import { attachHydrationCache } from 'core/data/middlewares/hydration-cache';

import Super, { provider, ProviderOptions, Middlewares } from '@v4fire/core/core/data';

export * from '@v4fire/core/core/data';

@provider
class Provider extends Super {
  static override readonly middlewares: Middlewares = [
    ...Super.middlewares,
    attachHydrationCache
  ];
}
```
