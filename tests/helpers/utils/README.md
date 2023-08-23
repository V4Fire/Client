# tests/helpers/utils

This module provides some test utilities.

## API

### waitForFunction

Waits for the specified function to return `true` (`Boolean(result) === true`).
Similar to the `Playwright.Page.waitForFunction`, but it executes with the provided context.

```typescript
// `ctx` refers to `imgNode`
Utils.waitForFunction(imgNode, (ctx, imgUrl) => ctx.src === imgUrl, imgUrl)
```

### import

Imports the specified module into the page and returns `JSHandle` for this module.
Useful when you need to dynamically import a module in the `playwright` browser context.

```typescript
import type * as Provider from 'components/friends/data-provider';

const api = await Utils.import<typeof Provider>(page, 'components/friends/data-provider');
```

### reloadAndWaitForIdle

Reloads the page and waits until the page process becomes `idle`.

```typescript
await Utils.reloadAndWaitForIdle(page);
```

### collectPageLogs

Intercepts and collects all invocations of the `console` methods on the specified page.
Mind, the intercepted calls are not shown in the console until the `printPageLogs` method is invoked.

```typescript
await Utils.collectPageLogs(page);
```

### printPageLogs

Prints all of the intercepted `console` methods invocations to the console.

```typescript
await Utils.printPageLogs(page);
```

### evalInBrowser

Evaluates the given function in the `playwright` browser context.

```typescript
Utils.evalInBrowser(() => new Set([0, 1])); // in browser will become `new Set([0, 1])`
```
