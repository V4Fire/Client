# components/super/i-static-page/modules/page-meta-data

This module provides a class for managing the meta information of a page,
such as the title, description, and other meta tags.

## How To Use?

It is necessary to create an instance of the PageMetaData class and set in its settings:

1. An API for working with the target document's URL.
2. An optional array of elements for setting in the constructor, used to restore data from the environment.

```typescript
import PageMetaData from 'core/page-meta-data';

const pageMetaData = new PageMetaData(new URL(location.href), [
  {
    tag: 'title',
    attrs: {text: 'Example'}
  }
]);

pageMetaData.description = 'Hello world!';
pageMetaData.addMeta({charset: 'utf-8'});

console.log(pageMetaData.elements);
```

### How To Use It Inside A Component?

It is advisable to avoid directly using the PageMetaData class within a component,
as this approach is not compatible with Server-Side Rendering (SSR);
this is due to each request potentially has its own set of meta-parameters.
Consequently, the PageMetaData is typically instantiated within the application's global state by default,
as outlined in the `core/component/state` module.
To interact with it, the `remoteState` property should be employed.

```typescript
import iBlock, { component, prop, field } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  created() {
    console.log(this.remoteState.pageMetaData.title);
  }
}
```

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

### How To Use It With SSR?

An instance of the PageMetaData can be explicitly instantiated when the application is created.

```typescript
import express from 'express';

import { initApp } from 'core/init';

import { from, createCookieStore } from 'core/cookies';
import { CookieEngine } from 'core/kv-storage/engines/cookie';

import PageMetaData from 'core/page-meta-data';

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  const cookies = createCookieStore(req.headers.cookies);
  const location = new URL('https://example.com/user/12345');

  initApp('p-v4-components-demo', {
    location,
    cookies,

    pageMetaData: new PageMetaData(location, [
      {
        tag: 'title',
        attrs: {text: 'example'}
      }
    ])
  })

  .then(({content, styles, state}) => {
    res.send(`${state.pageMetaData.render()}<style>${styles}</style>${content}`);
  });
});

app.listen(port, () => {
  console.log(`Start: http://localhost:${port}`);
});
```

## Getters

### elements

An array of added meta-elements.

```typescript
import iBlock, { component, prop, field } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  created() {
    console.log(this.r.pageMetaData.elements);
  }
}
```

## Accessors

### title

The current page title.

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

The current page description.

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

### render

Renders a list of added elements and returns the result.
For SSR, this will be an HTML string.

```typescript
import express from 'express';

import { initApp } from 'core/init';

import { from, createCookieStore } from 'core/cookies';
import { CookieEngine } from 'core/kv-storage/engines/cookie';

import PageMetaData from 'core/page-meta-data';

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  const cookies = createCookieStore(req.headers.cookies);
  const location = new URL('https://example.com/user/12345');

  initApp('p-v4-components-demo', {
    location,
    cookies,

    pageMetaData: new PageMetaData(location, [
      {
        tag: 'title',
        attrs: {text: 'example'}
      }
    ])
  })

  .then(({content, styles, state}) => {
    res.send(`${state.pageMetaData.render()}<style>${styles}</style>${content}`);
  });
});

app.listen(port, () => {
  console.log(`Start: http://localhost:${port}`);
});
```

### addLink

Adds a new link element with the given attributes to the current page.

```typescript
import iBlock, { component, prop, field } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  created() {
    this.r.pageMetaData.addLink({rel: 'canonical', href: 'https://example.com'});
  }
}
```

### removeLinks

Removes link elements with the given attributes from the current page.

```typescript
import iBlock, { component, prop, field } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  updated() {
    this.r.pageMetaData.removeLinks({rel: 'canonical', href: 'https://example.com'});
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

### getCanonicalLink

Returns a canonical link `<link rel="canonical" />`.

```typescript
import iBlock, { component, prop, field } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  updated() {
    console.log(this.r.pageMetaData.getCanonicalLink());
  }
}
```

### setCanonicalLink

Sets a news canonical link `<link rel="canonical" />` to the current page.

```typescript
import iBlock, { component, prop, field } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  created() {
    this.r.pageMetaData.setCanonicalLink('https://example.com');
    console.log(this.r.pageMetaData.getCanonicalLink());
  }
}
```

### removeCanonicalLink

Removes the canonical link `<link rel="canonical" />` from the current page.

```typescript
import iBlock, { component, prop, field } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  updated() {
    this.r.pageMetaData.removeCanonicalLink();
  }
}
```

### addMeta

Adds a new meta-element with the given attributes to the current page.

```typescript
import iBlock, { component, prop, field } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  created() {
    this.r.pageMetaData.addMeta({name: 'robots', content: 'noindex'});
  }
}
```

### removeMetas

Removes meta-elements with the given attributes from the page.

```typescript
import iBlock, { component, prop, field } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  updated() {
    this.r.pageMetaData.removeMetas({name: 'robots', content: 'noindex'});
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
