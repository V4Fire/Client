# Проблемы при запуске

Содержание:

- [COMPONENTS is not defined](#COMPONENTS-is-not-defined)
- [Тесты стартуют, но все фейлятся](#Тесты-стартуют,-но-все-фейлятся)
- [Зависает выполнение теста при использовании fixture](#Зависает-выполнение-теста-при-использовании-fixture)
- [h.dom.something cannot read property something of undefined](#h.dom.something-cannot-read-property-something-of-undefined)
- [Помните что импорты ведут к выполнению кода](#Помните-что-импорты-ведут-к-выполнению-кода)

## COMPONENTS is not defined

Где-то импортится `config` и вместо пакета из-за алиасинга импортится `config/index.ts`.
Для решения проблемы замените `config` на алиас `@config/config`, более подробно узнать про это можно в миграционном гайде.

## Тесты стартуют, но все фейлятся

Убедитесь что проект собран `npx webpack`

## Зависает выполнение теста при использовании fixture

Убедитесь что вы используете функцию `use` для регистрации вашей `fixture`

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

1. Убедитесь что установили флаг для запуска TS тестов `cross-env NODE_OPTIONS="-r @v4fire/core/build/tsnode.js" npx playwright test --config config`
2. Убедитесь что указали конфиг при запуске команды

## h.dom.something cannot read property something of undefined

Возникает в JS файлах при импорте TS файлов (хелперов)

Поправить импорт модуля

```js
const
  h = include('tests/helpers').default;
```

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
