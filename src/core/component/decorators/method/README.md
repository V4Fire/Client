# core/component/decorators/method

The decorator marks a class method or accessor as a component part.

Typically, this decorator does not need to be used explicitly,
as it will be automatically added in the appropriate places during the build process.

```typescript
import { method } from 'core/component/decorators/method';
import iBlock, { component, prop, system } from 'components/super/i-block/i-block';

@component()
class bExample extends iBlock {
  @method('accessor')
  get answer() {
    return 42;
  }

  @method('method')
  just() {
    return 'do it';
  }
}
```
