## Proposal

### Требования к тестам

- Возможность запуск тестов в разных окружениях
- Возможность использовать typescript для тестов

### Запуск тестов

- export NODE_OPTIONS="-r @v4fire/core/build/tsnode.js"

### Запуск в разных окружениях (not final)

Для запуска в разных окружениях будет использоваться всеми нами знакомая концепция "движок/бридж/адаптер".

У нас будет класс-адаптер который будет иметь общие методы, он будет реализовать какую-либо общую логику и делегировать
вызовы на выбранный движок.

```typescript
class EngineProvider {
  goToPage<T extends string>(pageNameWithPrefix: T, params: deeplinkParams[T], options: GoToPageOptions): Promise<void> {
    this.currentEngine.goToPage(pageNameWithPrefix, param, options);
  }
}

class BrowserEngine {
  goToPage<T extends string>(pageNameWithPrefix: T, params: deeplinkParams[T], options: GoToPageOptions): Promise<void> {
    const
      url = this.transformParamsIntoUrl(pageNameWithPrefix, params);

    const
      context = await this.engine.newContext(),
      page = await context.newPage();

    return page.goto(transformParamsIntoUrl);
  }
}

class AndroidWebviewEngine {
  goToPage<T extends string>(pageNameWithPrefix: T, params: deeplinkParams[T], options: GoToPageOptions): Promise<void> {
    const
      url = this.transformParamsIntoDeeplink(pageNameWithPrefix, params);

    const
      context = await this.engine.newContext(),
      page = await context.newPage();

    return page.goto(transformParamsIntoUrl);
  }
}
```

Выбор движка для запуска теста:

TEST_ENGINE = android-webview | ios-webview | browser
