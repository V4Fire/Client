# tests/helpers/dom

This module provides API for working with the document object model.

## API

### getPageDescription

Returns page meta description.

```typescript
const description = DOM.getPageDescription();
```

### elNameGenerator

Returns the full element name.

```typescript
const elName = DOM.elNameGenerator('p-index', 'page'); // 'p-index__page'
```

### elSelectorNameGenerator

Returns the selector for the full element name.

```typescript
const elName = DOM.elSelectorNameGenerator('p-index', 'page'); // '.p-index__page'
```

### elNameGenerator

Return the full element name with the specified modifier.

```typescript
const
  base = DOM.elNameGenerator('p-index')                      // Function,
  elName = base('page'),                                 // 'p-index__page'
  modsBase = DOM.elModNameGenerator(elName, 'type', 'test'); // 'p-index__page_type_test'
```

### elModSelectorGenerator

Returns the selector for the full element name with the specified modifier.

```typescript
const
  base = DOM.elNameGenerator('p-index')                          // Function,
  elName = base('page'),                                     // 'p-index__page'
  modsBase = DOM.elModSelectorGenerator(elName, 'type', 'test'); // '.p-index__page_type_test'
```

### isVisible

Returns `true` if the specified element is in the viewport.


```typescript
const isVisible = await DOM.isVisible('.b-button', page)
```
