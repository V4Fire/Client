# Troubleshooting <!-- omit in toc -->

- [COMPONENTS are not defined](#components-are-not-defined)
- [All tests have failed](#all-tests-have-failed)
- [Test execution freezes when using fixture](#test-execution-freezes-when-using-fixture)
- [Playwright can't find tests](#playwright-cant-find-tests)
- [Imports lead to the code execution](#imports-lead-to-the-code-execution)

## COMPONENTS are not defined

Somewhere `config` is imported and `config/index.ts` is imported instead of a package due to aliasing.
To solve the problem, replace `config` with the alias `@config/config`, you can learn more about this in the migration guide.

## All tests have failed

Make sure the project is built: `npx webpack`.

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

## Imports lead to the code execution

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
