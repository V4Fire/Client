# tests/helpers/bom

This module provides API to work with the browser object model.

## API

### waitForIdleCallback

Waits until the page process is switched to `idle`.

```typescript
await BOM.waitForIdleCallback(page);
```

### waitForRAF

Waits until `requestAnimationFrame` fires on the page.

```typescript
await BOM.waitForRAF(page);
```
