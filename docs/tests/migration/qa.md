# Проблемы при запуске

## Помните что импорты ведут к выполнению кода

```typescript
const
  {userAgent} = navigator;

export function something(): void {
  return userAgent;
}
```

```typescript
import { test } from '@playwright/test';
import { something } from 'file';

test('something', () => {
  test.expect(something()).toBe(undefined);
})
```

Запуск такого теста приведет к ошибке во время исполнения из-за того что в `nodejs` окружении нет `navigator`.

