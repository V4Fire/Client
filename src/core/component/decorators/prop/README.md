# core/component/decorators/prop

The decorator marks a class property as a component prop.

```typescript
import iBlock, { component, prop } from 'super/i-block/i-block';

@component()
class bExample extends iBlock {
  @prop(Number)
  bla: number = 0;

  @prop({type: Number, required: false})
  baz?: number;

  @prop({type: Number, default: () => Math.random()})
  bar!: number;
}
```

#### Additional options

