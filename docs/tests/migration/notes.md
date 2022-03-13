## API:

grep / grep-invert - выбрать тесты на reg exp названию теста

есть конфиг playwright - должна быть возможность создать его и переопределить

есть beforeAll, afterAll, beforeEach

есть globalSetup в конфиг файле в котором можно подготавливать все тесты

можно в конфиг файле загрузить storageState.json

test.use({ storageState: 'adminStorageState.json' }); !!! можно загружать состояние прям в тесте

можно написать свой репортер, можно заиспользовать готовый, можно использовать несколько, есть html репортер https://playwright.dev/docs/test-reporters#html-reporter
https://playwright.dev/docs/test-reporters#github-actions-annotations гитхабовский

```javascript
const config: PlaywrightTestConfig = {
  reporter: [
    ['list'],
    ['json', {  outputFile: 'test-results.json' }]
  ],
};
```

Группировка тестов чтобы они выполнялись один за другим https://playwright.dev/docs/test-retries#serial-mode

Таймауты https://playwright.dev/docs/test-timeouts

Запуск сервера и baseURL https://playwright.dev/docs/test-advanced#launching-a-development-web-server-during-the-tests

Конфиг может состоять из нескольких объектов для конфигурации https://playwright.dev/docs/test-advanced#configuration-object . То есть можно для каждой папки с тестами сделать по своему конфигу и импортить их + мержить,
то есть настройку окружения можно вынести в конфигурационной файл

Репорт медленных тестов https://playwright.dev/docs/api/class-testconfig#test-config-report-slow-tests

Fixture https://playwright.dev/docs/test-fixtures#with-fixtures , удобно для настройки окружения, хорош вписываются в page-object model
https://playwright.dev/docs/test-fixtures#creating-a-fixture , можно переопределять

```javascript
// example.spec.ts
import { test as base } from '@playwright/test';
import { TodoPage } from './todo-page';

// Extend basic test by providing a "todoPage" fixture.
const test = base.extend<{ todoPage: TodoPage }>({
  todoPage: async ({ page }, use) => {
    const todoPage = new TodoPage(page);
    await todoPage.goto();
    await todoPage.addToDo('item1');
    await todoPage.addToDo('item2');
    await use(todoPage);
    await todoPage.removeAll();
  },
});

test('should add an item', async ({ todoPage }) => {
  await todoPage.addToDo('my item');
  // ...
});

test('should remove an item', async ({ todoPage }) => {
  await todoPage.remove('item1');
  // ...
});
```

## Запуск:

### Give failing tests 3 retry attempts

```bash
npx playwright test --retries=3
```

## Идеи

### Разработать механизм моков

Тут пока ниче непонятно и непонятно нужно ли

### Загружать файлы прямо во время выполнения теста в рантайме

То есть прям тесте импортить in-view и загружать в браузер, после этого начинать использовать API

### Запуск в вебвью тестов которые есть у нас

Иметь возможность запускать e2e в наших вебвью, а так же performance тесты

### Пропускать события аналитики

https://edadeal.slack.com/archives/C018CFMBZM4/p1645035786228399

### Разделять unit тесты и e2e тесты с помощью названий файлов

test.component.js
test.spec.js
test.e2e.js
test.perf.js

Можно выбрать что запустить, либо e2e либо unit тесты

### Добавить testPage fixture

Добавить фикстуру для тестовой страницы https://playwright.dev/docs/test-fixtures#creating-a-fixture

### Не забыть про

- Как запускать демо страницу для unit тестов, не хочется постоянно ее создавать и прочее из проекта в проект
- Сделать возможность запускать обычные тесты

### 