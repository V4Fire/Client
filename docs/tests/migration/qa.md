# Troubleshooting

- [COMPONENTS is not defined](#COMPONENTS-is-not-defined)
- [All tests are failed](#all-tests-are-failed)
- [Test execution freezes when using fixture](#test-execution-freezes-when-using-fixture)
- [Playwright can't find tests](#playwright-cant-find-tests)
- [h.dom.something cannot read property something of undefined](#hdomsomething-cannot-read-property-something-of-undefined)
- [Does typescript work in old tests](#does-typescript-work-in-old-tests)
- [Imports leads to code execution](#imports-leads-to-code-execution)

## COMPONENTS is not defined

Somewhere `config` is imported and `config/index.ts` is imported instead of a package due to aliasing.
To solve the problem, replace `config` with the alias `@config/config`, you can learn more about this in the migration guide.

## All tests are failed

Make sure the project is built `npx webpack`.

## Test execution freezes when using fixture

Make sure you use the `use` function to register your `fixture`.

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

## Playwright can't find tests

1. Make sure you set the flag to run TS tests `cross-env NODE_OPTIONS="-r @v4fire/core/build/tsnode.js" npx playwright test --config config`;
2. Make sure you specify the config when running the command;
3. Make sure your tests placed in correct folder.

## h.dom.something cannot read property something of undefined

Reproduces in JS files when importing TS files (helpers).

Fix module import:

```js
const
  h = include('tests/helpers').default;
```

## Does typescript work in old tests

Yes, you can import helpers written in typescript.

## Imports leads to code execution

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

Running such a test will result in a runtime error due to the fact that there is no `navigator` in the `nodejs` environment.
