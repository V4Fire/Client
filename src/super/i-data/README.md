# super/i-data

This module provides a super component for all components that need to download data from data providers.

```typescript
import 'models/user';
import iData, { component, wait } from 'super/i-data/i-data';

interface MyData {
  name: string;
  age: number;
}

@component()
export default class bExample extends iData {
  /** @override */
  readonly DB!: MyData;

  /** @override */
  dataProvider: string = 'User';

  @wait('ready')
  getUser(): CanPromise<this['DB']> {
    return this.db;
  }
}
```
