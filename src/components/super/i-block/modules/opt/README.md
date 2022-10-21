# components/super/i-block/modules/opt

This module provides a class with helper methods to optimize component rendering.

## Methods

### ifOnce

Returns a number if the specified label:

`2` -> already exists in the cache;
`1` -> just written in the cache;
`0` -> does not exist in the cache.

This method is used with conditions to provide logic: if the condition switched to true,
then it always returns true in the future.

```
< .content v-if = opt.ifOnce('opened', m.opened === 'true')
  Very big content
```

### showAnyChanges

Shows any changes to the component properties in the debugger console.
This method is useful to debug.

```typescript
import iBlock, { component } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  mounted() {
    this.opt.showAnyChanges();
  }
}
```
