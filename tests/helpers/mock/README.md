# tests/helpers/mock

This module provides utility functions for working with `jest-mock` and `Playwright`.

## Usage

Import the required functions from the `tests/helpers/mock` module to use the test helpers in your test files:

```typescript
import {
  wrapAsSpy,
  createSpy,
  getSpy,
  createMockFn,
  injectMockIntoPage
} from 'tests/helpers/mock';
```

## API Reference

### wrapAsSpy

Wraps an object as a spy object by adding additional properties for accessing spy information.

```typescript
function wrapAsSpy(agent: JSHandle<ReturnType<ModuleMocker['fn']> | ReturnType<ModuleMocker['spyOn']>>, obj: T): T & SpyObject;
```

- `agent`: The JSHandle representing the spy or mock function.
- `obj`: The object to wrap as a spy object.
- Returns: The wrapped object with spy properties.

### createSpy

Creates a spy object.

```typescript
async function createSpy<T extends JSHandle, ARGS extends any[]>(
  ctx: T,
  spyCtor: (ctx: ExtractFromJSHandle<T>, ...args: ARGS) => ReturnType<ModuleMocker['spyOn']>,
  ...argsToCtor: ARGS
): Promise<SpyObject>;
```

- `ctx`: The `JSHandle` to spy on.
- `spyCtor`: The function that creates the spy.
- `argsToCtor`: The arguments to pass to the spy constructor function.
- Returns: A promise that resolves to the created spy object.

Usage:

```typescript
const ctx = ...; // JSHandle to spy on
const spyCtor = (ctx) => jestMock.spy(ctx, 'prop'); // Spy constructor function
const spy = await createSpy(ctx, spyCtor);

// Access spy properties
console.log(await spy.calls);
console.log(await spy.callsLength);
console.log(await spy.lastCall);
console.log(await spy.results);
```

### getSpy

Retrieves an existing `SpyObject` from a `JSHandle`.

```typescript
async function getSpy<T extends JSHandle>(
  ctx: T,
  spyExtractor: SpyExtractor<ExtractFromJSHandle<T>, []>
): Promise<SpyObject>;
```

- `ctx`: The `JSHandle` containing the spy object.
- `spyExtractor`: The function to extract the spy object.
- Returns: A promise that resolves to the spy object.

Usage:

```typescript
const component = await Component.createComponent(page, 'b-button', {
  attrs: {
    '@hook:beforeDataCreate': (ctx) => jestMock.spy(ctx.localEmitter, 'emit')
  }
});

const spyExtractor = (ctx) => ctx.unsafe.localEmitter.emit;

const spyObject = await getSpy(component, spyExtractor);

// Now you can access spy information from the spy object
console.log(await spyObject.calls);
console.log(await spyObject.callsLength);
console.log(await spyObject.lastCall);
console.log(await spyObject.results);
```

### createMockFn

Creates a mock function and injects it into a Page object.

```typescript
async function createMockFn(
  page: Page,
  fn: (...args: any[]) => any,
  ...args: any[]
): Promise<SpyObject>;
```

- `page`: The Page object to inject the mock function into.
- `fn`: The mock function.
- `args`: The arguments to pass to the function.
- Returns: A promise that resolves to the mock function as a `SpyObject`.

Usage:

```typescript
const page = ...; // Page object
const fn = () => {}; // The mock function
const mockFn = await createMockFn(page, fn);
 *
// Access spy properties
console.log(await mockFn.calls);
console.log(await mockFn.callsLength);
console.log(await mockFn.lastCall);
console.log(await mockFn.results);
```

### injectMockIntoPage

Injects a mock function into a Page object and returns the `SpyObject`.

```typescript
async function injectMockIntoPage(
  page: Page,
  fn: (...args: any[]) => any,
  ...args: any[]
): Promise<{agent: SpyObject; id: string}>;
```

- `page`: The Page object to inject the mock function into.
- `fn`: The mock function.
- `args`: The arguments to pass to the function.
- Returns: A promise that resolves to an object containing the spy object and the ID of the injected mock function.

Usage:

```typescript
const page = ...; // Page object
const fn = () => {}; // The mock function
const { agent, id } = await injectMockIntoPage(page, fn);

// Access spy properties
console.log(await agent.calls);
console.log(await agent.callsLength);
console.log(await agent.lastCall);
console.log(await agent.results);
```