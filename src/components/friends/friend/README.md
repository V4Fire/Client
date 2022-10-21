# components/friends/friend

This module provides a superclass to create classes friendly to the main component class,
i.e. it can use private or protected methods and properties.

__b-example/theme.ts__

```typescript
import Friend from 'components/friends/friend';

export default class Theme extends Friend {
  theme: string = this.ctx.initialTheme;

  setTheme(newTheme: string): void {
    this.theme = newTheme;
  }
}
```

__b-example/b-example.ts__

```typescript
import iBlock, { component, system } from 'components/super/i-block/i-block';

import Theme from 'b-example/theme';

@component()
export default class bExample extends iBlock {
  protected initialTheme?: string;

  @system((o) => new Theme(o))
  theme: Theme;

  created() {
    this.theme.setTheme('demo');
  }
}
```
