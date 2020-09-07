# core/dom/image

This module provides API to load images by using `background-image` or `src`.

## Callbacks

| Name       | Description                                  | Payload description  | Payload   |
| ---------- |----------------------------------------------| -------------------- |-----------|
| `load`     | Invoked after successful loading of an image | `el` bonded node     | `Element` |
| `error`    | Invoked if loading error appears             | `el` bonded node     | `Element` |

## Usage

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
