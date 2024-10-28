# core/cache/decorators/hydration

This module provides a decorator that enables data from the hydration store to be integrated with a cache structure.

## How Does It Work?

The decorator creates a caching wrapper that retrieves initial data from the hydration store.
After the first retrieval, the data in the hydration store is deleted.
Subsequently, the cache operates as usual.

## Usage

```typescript
import { addHydrationCache } from 'core/cache/decorators/hydration';

import SimpleCache from 'core/cache/simple';
import HydrationStore from 'core/hydration-store';

const
  cache = new SimpleCache(),
  hydrationStore = new HydrationStore();

const
  id = 'uniqueKeyForTheHydration',
  cacheKey = 'cacheKey';

hydrationStore.init(id);
hydrationStore.set('foo', {key: 'value'});

const hydrationCache = addHydrationCache(cache, hydrationStore, {id, cacheKey});

hydrationCache.get('foo'); // {key: 'value'}
hydrationStore.get('foo'); // undefined
```
