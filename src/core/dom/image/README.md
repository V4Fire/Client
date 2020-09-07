# core/dom/image

This module provides API to load images by using `background-image` or `src`.

## Callbacks

| Name       | Description                                      | Payload description  | Payload   |
| ---------- |------------------------------------------------- | -------------------- |-----------|
| `load`     | Invoked when an image was successfully loaded    | `el` bonded node     | `Element` |
| `error`    | Invoked when a loading error of an image appears | `el` bonded node     | `Element` |

## Usage

### Basic

```typescript
import { ImageLoader } from 'core/dom/image';

@component()
export default class bSomeComponent extends iBlock {
  @hook('mounted')
  initImage(): void {
    ImageLoader.init(<HTMLDivElement | HTMLImageElement>this.$el, {
      src: 'https://img.src'
    })
  }
}
```

### Using callbacks

```typescript
import { ImageLoader } from 'core/dom/image';

@component()
export default class bSomeComponent extends iBlock {
  @hook('mounted')
  initImage(): void {
    ImageLoader.init(this.$el, {
      src: 'https://img.src',
      ctx: this,
      load: (el) => this.doSomething(el),
      error: (el) => alert('help')
    })
  }
}
```

> It is highly recommended to specify the context if you are using callbacks explicitly.

### Additional stages

Stages of an image:

1. `preview` – It will be displayed until the main image is loading.
2. `main` – It will be displayed until then the main image is loaded.
3. `broken` – It will be displayed if the main image failed to load.

```typescript
import { ImageLoader } from 'core/dom/image';

@component()
export default class bSomeComponent extends iBlock {
  @hook('mounted')
  initImage(): void {
    ImageLoader.init(this.$el, {
      src: 'https://img.src',
      preview: 'https://preview.src',
      broken: 'https://broken.src'
    })
  }
}
```

### Different image formats

You can use several different image formats or resolutions by using the `srcset` and `sources` options.

```typescript
import { ImageLoader } from 'core/dom/image';

@component()
export default class bSomeComponent extends iBlock {
  @hook('mounted')
  initImage(): void {
    ImageLoader.init(this.$el, {
      src: 'https://img.src',
      sources: [{
        type: 'webp',
        sources: [{srcset: 'https://img-webp.src', type: 'webp'}]
      }]
    })
  }
}
```

### Default value for stage images

To not install a preview or a broken image every time, it is possible to set theDefault settings.
Override the `const.ts` file in your layer in the `core/dom/image` folder.

__const.ts__
```typescript
import { DefaultParams } from 'core/dom/image';

export * from '@v4fire/client/core/dom/image/const'

/** @override */
export const defaultParams: DefaultParams = {
  broken: {
    src: require('assets/img/no-image.svg'),
    bgOptions: {
      size: 'contain',
      position: '50% 50%'
    }
  }
};
```
