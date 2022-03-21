# Проблемы при запуске

## Тесты стартуют, но все фейлятся

- Убедитесь что проект собран `npx webpack`

## Зависает выполнение теста при использовании fixture

- Убедитесь что вы заиспользовали функцию `use` для регистрации вашей `fixture`

```typescript
export const test = base.extend<MyFixtures>({
  todoPage: async ({ page }, use) => {
    // Set up the fixture.
    const todoPage = new TodoPage(page);

    // Use the fixture value in the test.
    await use(todoPage);

    // Clean up the fixture.
    await todoPage.removeAll();
  },
}
```

## Не находит тесты по переданному пути

- Убедитесь что установили флаг для запуска TS тестов `cross-env NODE_OPTIONS="-r @v4fire/core/build/tsnode.js" npx playwright test` (TBD)
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

