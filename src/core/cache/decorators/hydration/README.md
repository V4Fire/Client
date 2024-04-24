# core/cache/decorators/hydration

This module provides the decorator that allows to use the data from the hydration store in a cache.

## How it works

The decorator creates a cache wrapper that uses the data from the hydration store to get the initial data.
The hydration store value will be deleted after the first get operation. After that, the cache will work as usual.

## Usage

```typescript
import { addHydrationCache } from 'core/cache/decorators/hydration';

import SimpleCache from 'core/cache/simple';
import { HydrationStore } from 'core/component';

const
  cache = new SimpleCache(),
  hydrationStore = new HydrationStore();

const
  id = 'uniqueKeyForTheHydration',
  cacheKey = 'cacheKey';

hydrationStore.init(id);
hydrationStore.set('foo', { key: 'value' });

const
  hydrationCache = addHydrationCache(cache, hydrationStore, id, cacheKey);

hydrationCache.get('foo'); // { key: 'value' }
```


