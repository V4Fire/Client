# tests/helpers/scroll

This module provides API for working with the scroll on a page.

## API

### scrollBy

```typescript
await Scroll.scrollBy(page, {left: 0, top: 500});
```

### scrollIntoViewIfNeeded

Waits for the element by the specified selector and scrolls a page to it if needed.

```typescript
await Scroll.scrollIntoViewIfNeeded(page, '.b-button');
```

### scrollToBottom

```typescript
await Scroll.scrollToBottom(page);
```

### scrollToBottomWhile

Scrolls a page until the passed function returns `true`, or until a time specified in `timeout` expires

```typescript
await Scroll.scrollToBottomWhile(
  page,
  () => document.querySelector('.some-dynamically-loaded-component') != null
);
```
