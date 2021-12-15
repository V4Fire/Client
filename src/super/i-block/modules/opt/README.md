# super/i-block/modules/opt

This module provides a class with helper methods to optimize components' rendering.

## ifOnce

Returns a number if the specified label:

`2` -> already exists in the cache;
`1` -> just written in the cache;
`0` -> does not exist in the cache.

This method is used with conditions to provide a logic: if the condition was switched to true,
then further, it always returns true.

```
< .content v-if = opt.ifOnce('opened', m.opened === 'true')
  Very big content
```

## memoizeLiteral

Tries to find a blueprint in the cache to the specified value and returns it,
or if the value wasn't found in the cache, it would be frozen, cached, and returned.

This method is used to cache raw literals within component templates to avoid redundant re-renders that occurs
because links to objects were changed.

```
< b-button :mods = opt.memoizeLiteral({foo: 'bla'})
```

## showAnyChanges

Shows in a terminal/console any changes of component properties.
This method is useful to debug.

```typescript
import iBlock, { component } from 'super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  mounted() {
    this.opt.showAnyChanges();
  }
}
```
