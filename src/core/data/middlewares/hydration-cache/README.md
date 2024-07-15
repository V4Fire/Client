# core/data/middlewares/hydration-cache

This module provides middleware that facilitates the utilization of data from the hydration store as a cache object.
It achieves this by leveraging
the [core/cache/decorators/hydration](../../../cache/decorators/hydration/README.md) module.

## Usage

```typescript
import { attachHydrationCache } from 'core/data/middlewares/hydration-cache';

import Super, { provider, ProviderOptions, Middlewares } from '@v4fire/core/core/data';

export * from '@v4fire/core/core/data';

@provider
class Provider extends Super {
  static override readonly middlewares: Middlewares = {
    ...Super.middlewares,
    attachHydrationCache: attachHydrationCache()
  };
}
```

## Options

Middleware can be additionally configured using special options.

### cacheId

A function that takes a provider object and returns the identifier by which the provider's data
will be stored in the cache.
By default, the name of the provider itself is used.

```typescript
import { attachHydrationCache } from 'core/data/middlewares/hydration-cache';

import Super, { provider, ProviderOptions, Middlewares } from '@v4fire/core/core/data';

export * from '@v4fire/core/core/data';

@provider
class Provider extends Super {
  static override readonly middlewares: Middlewares = {
    ...Super.middlewares,
    attachHydrationCache: attachHydrationCache({
      cacheId(provider: Provider): string {
        return `custom-${provider.providerName}`;
      }
    })
  };
}
```
