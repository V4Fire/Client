# Проблемы при запуске

## Не находит тесты по переданному пути

- Убедитесь что установили флаг для запуска TS тестов `export NODE_OPTIONS="-r @v4fire/core/build/tsnode.js"`
- Убедитесь что тесты соответствуют паттернам именования

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

