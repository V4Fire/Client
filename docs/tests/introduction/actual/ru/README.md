# V4 инструменты тестирования компонентов и модулей

- [Среда выполнения тестов](#среда-выполнения-тестов)
- [Настройка тестового окружения](#настройка-тестового-окружения)
- [Подготовка рантайм окружения](#подготовка-рантайм-окружения)
- [Создание теста](#создание-теста)
- [Запуск тестов](#запуск-тестов)
- [Создание компонентов](#создание-компонентов)
  - [`Component.createComponent`](#componentcreatecomponent)

## Среда выполнения тестов

* [Playwright](https://playwright.dev/)

## Настройка тестового окружения

Первым шагом для настройки тестового окружение будет создание файла [конфигураций](https://playwright.dev/docs/test-configuration) и наследование базовой конфигурация из `@v4fire/client`.

__tests/config/unit/index.ts__
```typescript
import superConfig from '@v4fire/client/tests/config/unit';

export default superConfig;
```

Далее необходимо создать тестовый сервер который будет запускать playwright и который будет раздавать файлы приложения
для тестирования. V4Fire предоставляет базовую настройку сервера, эту настройку можно унаследовать:

__tests/server/index.ts__
```typescript
import '@v4fire/client/tests/server';
```

Совсем необязательно использовать конфигурацию сервера из V4Fire, никаких ограничений на создание своего собственное сервера нет, но есть важные моменты, которые стоит учитывать:

1. Сервер должен уметь раздавать статические файлы;
2. По умолчанию в файле конфигураций сервера для `playwright` используется переменная окружения `TEST_PORT`, на основании ее генерируется [базовый URL](https://playwright.dev/docs/api/class-testoptions#test-options-base-url) для тестирования.

Базовый конфигурационный файл сервера для тестов:

__@v4fire/client/tests/server/config.ts__

```typescript
import { build } from '@config/config';

const webServerConfig: WebServerConfig = {
  port: build.testPort,
  reuseExistingServer: true,
  command: 'npm run test:server'
};
```

> Стоит обратить внимание что для запуска сервера по умолчанию используется команда `npm run test:server`.

## Подготовка рантайм окружения

Для того чтобы запустить тест нужно подготовить рантайм среду:

1. Создать страницу на которой будут выполнятся тестирование, для этого в V4Fire предусмотрено "демо страница" `@v4fire/client/pages/p-v4-components-demo`, но вы так же свободно можете добавить свою страницу. Далее создайте отдельный `entry point` для этой страницы или добавьте в основной, в случае с добавлением в основной не забудьте вырезать демо-страницу с помощью `monic` директив чтобы демо-страница не попала в продакшен сборку.

2. Указать в конфиге проекта имя демо-страницы `config/default#build.demoPage` (по умолчанию `p-v4-components-demo`);

3. Добавить в зависимости демо-страницы свой компонент который планируется протестировать;

__pages/p-v4-components-demo/index.js__
```javascript
package('p-v4-components-demo')
  .extends('i-static-page')
  .dependencies(
    'b-component'
  );
```

4. Скомпилировать проект `npx webpack`.

## Создание теста

Все подготовления выполнены, теперь необходимо создать сам тестовый файл, расположим тестовый файл в папке `b-component/test/unit`.

```
.
└── b-component/
  └── test/
    └── unit/
      └── functional.ts
```

__test/unit/functional.ts__

```typescript
import test from 'tests/config/unit/test';

test.describe('Some test', () => {
  test('opens the demo page', ({page, baseURL}) => {
    await page.goto(`${baseURL}/p-v4-components-demo.html`);

    const
      root = await page.waitForSelector('#root-component');

    test.expect(root).toBeTruthy();
  });
});
```

> Обратите внимание на импорт модуля `test`, он импортится не из `@playwright/test`, а из подготовленного заранее файла. Это нужно чтобы иметь возможность расширять спеки с помощью [fixture](https://playwright.dev/docs/api/class-fixtures).

Согласитесь что переход с помощью `${baseURL}/p-v4-components-demo.html` выглядит неудобно, именно здесь вступают в игру [`fixture`](https://playwright.dev/docs/api/class-fixtures).

Давайте перепишем этот тест с использованием `fixture`:

__test/unit/functional.ts__

```typescript
import test from 'tests/config/unit/test';

test.describe('Some test', () => {
  test('opens the demo page', ({demoPage, page}) => {
    await demoPage.goto();

    const
      root = await page.waitForSelector('#root-component');

    test.expect(root).toBeTruthy();
  });
});
```

V4Fire представляет стандартную `fixture` которая призвана облегчить работу с демо-страницей, одним из методов является переход на эту страницу. Под капотом этот метод берет `baseURL` который предоставляет `playwright`, имя демо-страницы из конфига и после выполняет переход по этому URL.

```typescript
class DemoPage {
  /**
   * Opens a demo page
   */
  async goto(): Promise<DemoPage> {
    await this.page.goto(concatURLs(this.baseUrl, `${build.demoPage}.html`), {waitUntil: 'networkidle'});
    await this.page.waitForSelector('#root-component', {state: 'attached'});

    return this;
  }
}
```

> Вы свободно можете перезаписать/удалить/расширить данную `fixture` в своем проекте, [более подробно про `fixture`](https://playwright.dev/docs/test-fixtures).

## Запуск тестов

Чтобы запустить скрипты на `typescript` в `nodejs` вам необходимо подключить [`tsnode`](https://www.npmjs.com/package/ts-node). V4Fire предоставляет скрипт который инициализирует `tsnode`. Самый удобной способ выполнить этот скрипт с помощью
переменной окружения `NODE_OPTIONS` и флага `-r`.

```
npx cross-env NODE_OPTIONS=\"-r @v4fire/core/build/tsnode.js\" playwright test --config tests/config/unit/index.ts
```

Убедитесь что вы указали путь до конфига в параметр `--config`. 

Стоит отметить что такой вызов слишком громоздкий и постоянно писать столько текст - неудобно. Чтобы этого избежать рекомендую добавить этот вызов в секцию `script` файла `package.json`.

__package.json__

```
"scripts": {
  "test:unit": "cross-env NODE_OPTIONS=\"-r @v4fire/core/build/tsnode.js\" playwright test --config tests/config/unit/index.ts"
}
```

## Создание компонентов

Теперь у нас есть тестовый файл, страница для тестирования и команда для запуска тестов. Но в данный момент при переходе на эту страницу она будет пустая и на ней не будет никаких компонентов.

Для того чтобы отрисовать новый компонент V4Fire предоставляет API, это позволяет отрисовать любой компонент попавший в бандл.

> Убедитесь что добавили компоненты которые хотите протестировать в бандл, например по средствами добавление зависимости в `index.js` компонента.

### `Component.createComponent`

Эта функция позволяет создавать компоненты в рантайме. Давайте воспользуемся ей и создадим новый компонент для тестирования.

__test/unit/functional.ts__
```typescript
import type { JSHandle } from 'playwright';

import test from 'tests/config/unit/test';
import Component from 'tests/helpers/component';

import type bComponent from 'base/b-component/b-component';

test.describe('b-component функциональный тест', () => {
  let
    bComponent: JSHandle<bComponent>;

  test.beforeEach(({demoPage, page}) => {
    await demoPage.goto();

    bComponent = await Component.createComponent(page, 'b-component', {
      attrs: {
        someProp: 1,
        someFnProp: () => 1
      }
    });
  });

  test('Создает с правильным именем', () => {
    const
      name = await bComponent.evaluate((ctx) => ctx.componentName);

    test.expect(name).toBe('b-component');
  });
});
```
