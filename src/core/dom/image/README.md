# core/dom/image

This module provides API to load images by using `background-image` or `src`.

## Callbacks

| Name       | Description                                      | Payload description | Payload   |
| ---------- | ------------------------------------------------ | ------------------- | --------- |
| `load`     | Invoked when an image was successfully loaded    | `el` bound node     | `Element` |
| `error`    | Invoked when a loading error of an image appears | `el` bound node     | `Element` |

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

### Lazy loading

Sometimes you do not need to load an image immediately. It is considered good practice to load images lazily,
that is, only when they appear on the user's screen, a special option `lazy` is supported for this.

Set this option to `true`, and the main image will be loaded only when it appears on the user's screen.

```typescript
import { ImageLoader } from 'core/dom/image';

@component()
export default class bSomeComponent extends iBlock {
  @hook('mounted')
  initImage(): void {
    ImageLoader.init(<HTMLDivElement | HTMLImageElement>this.$el, {
      src: 'https://img.src',
      ctx: this,
      lazy: true
    })
  }
}
```

> It is highly recommended to specify the context if you are using the `lazy` option explicitly.

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

Available stages of an image:

1. `preview` – the main image is loading; till the loading complete, there will be shown a placeholder.
2. `main` – the main image has been loaded.
3. `broken` – the main image hasn't been loaded due to an error; there will be shown an error placeholder.

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

You can use several image formats or resolutions by using the `srcset` and `sources` options.

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

To avoid redundant code lines, you can specify default parameters for load and error stages of an image.

**core/dom/image/const.ts**

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
