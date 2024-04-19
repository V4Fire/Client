# components/super/i-static-page/modules/page-meta-data

This module provides an API for manipulating page metadata, such as the page title or description.

## How to Use?

By default, any component that inherited from [[iStaticPage]] has the `pageMetaData` property.
To access this API from an arbitrary component, use it via the root component.

```typescript
import iBlock, { component, prop, field } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  created() {
    this.r.pageMetaData.title = 'Example';
    console.log(this.r.pageMetaData.description);
  }
}
```

## Accessors

### title

Current page title.

```typescript
import iBlock, { component, prop, field } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  created() {
    this.r.pageMetaData.title = 'Example';
    console.log(this.r.pageMetaData.title);
  }
}
```

### description

Current page description.

```typescript
import iBlock, { component, prop, field } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  created() {
    this.r.pageMetaData.description = 'Example';
    console.log(this.r.pageMetaData.description);
  }
}
```

## Methods

### addLink

Adds a new link tag with the given attributes to the current page.

```typescript
import iBlock, { component, prop, field } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  created() {
    this.r.pageMetaData.addLink({rel: 'canonical', href: 'https://example.com'});
  }
}
```

### findLinks

Searches for link elements with the given attributes and returns them.

```typescript
import iBlock, { component, prop, field } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  created() {
    this.r.pageMetaData.addLink({rel: 'canonical', href: 'https://example.com'});
    console.log(this.r.findLinks({rel: 'canonical'}).length);
  }
}
```

### addLink

Adds a new link tag with the given attributes to the current page.

```typescript
import iBlock, { component, prop, field } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  created() {
    this.r.pageMetaData.addLink({rel: 'canonical', href: 'https://example.com'});
  }
}
```

### addMeta

Adds a new meta element on a page.

```typescript
import iBlock, { component, prop, field } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  created() {
    this.r.pageMetaData.addMeta({name: 'robots', content: 'noindex'});
  }
}
```

### findMetas

Searches for meta elements with the given attributes and returns them.

```typescript
import iBlock, { component, prop, field } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  created() {
    this.r.pageMetaData.addMeta({name: 'robots', content: 'noindex'});
    console.log(this.r.findMetas({name: 'robots'}).length);
  }
}
```
