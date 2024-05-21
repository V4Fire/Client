# tests/helpers/component

This module provides API for working with the components.

## API

### createComponents

Creates multiple instances of the specified component on the page.

```typescript
await Component.createComponents(page, 'b-button', [{type: 'button'}, {type: 'submit'}])
```

### createComponent

Creates component on the page and returns `JSHandle` to it.

```typescript
const buttonHandle = await Component.createComponent(page, 'b-button', {type: 'button'});
```

### removeCreatedComponents

Removes all components created by the `createComponent` and `createComponents` from the page.

```typescript
await Component.removeCreatedComponents(page);
```

### getComponentByQuery

Returns `JSHandle` to the component's instance for the specified query selector.

```typescript
const componentHandle = await Component.getComponentByQuery(page, '.b-button');
```

### waitForComponentByQuery

Waits until the component is attached to the page and returns `JSHandle` to the component's instance
for the specified query selector.

```typescript
const componentHandle = await Component.waitForComponentByQuery(page, '.b-button');
```

### getComponents

Returns `JSHandles` to the components instances for the specified query selector.

```typescript
const componentsHandlers = await Component.getComponents(page, '.b-button');
```

### waitForRoot

Returns `JSHandle` to the root component.

```typescript
const rootHandle = await Component.waitForRoot(page);
```

### waitForComponentStatus

Waits until the component has the specified status and returns `JSHandle` to the component's instance
for the specified query selector.

```typescript
await Component.waitForComponentStatus(page, '.b-button', 'ready');
```

### waitForComponentTemplate

Waits until the template of a component is loaded. Useful for dynamically loaded components.
Prevents flaky tests.

```typescript
await Component.waitForComponentTemplate(page, 'b-button');
```
