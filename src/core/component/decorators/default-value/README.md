# core/component/decorators/default-value

The decorator sets a default value for any prop or field of a component.
The value is set using a getter function.

Typically, this decorator does not need to be used explicitly,
as it will be automatically added in the appropriate places during the build process.

```typescript
import iBlock, { component, prop, defaultValue } from 'components/super/i-block/i-block';

@component()
class bExample extends iBlock {
  @defaultValue(() => 0)
  @prop(Number)
  bla!: number;
}
```
