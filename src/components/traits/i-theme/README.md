# components/traits/i-theme

This trait provides a theme API for any component.

## Synopsis

* This module provides an abstract class, not a component.

* The trait contains only TS logic.

* The trait can be automatically derived.

  ```typescript
  import { derive } from 'core/functools/trait';

  import iTheme from 'components/traits/i-theme/i-theme';
  import themeManagerFactory, { ThemeManager } from 'components/super/i-static-page/modules/theme';
  import iBlock, { component } from 'components/super/i-block/i-block';

  interface iStaticPage extends Trait<typeof iTheme> {}

  @component()
  @derive(iTheme)
  abstract class iStaticPage extends iBlock implements iTheme {
    @system<iStaticPage>(themeManagerFactory)
	   readonly theme: CanUndef<ThemeManager>;
  }

  export default iStaticPage;
  ```

## Methods

The trait specifies a bunch of methods to implement.

### changeTheme

Changes theme in ThemeManager.
The method has a default implementation.

```typescript
import iTheme from 'components/traits/i-theme/i-theme';
import iBlock, { component } from 'components/super/i-block/i-block';

@component()
export default class iStaticPage extends iBlock implements iTheme {
  /** {@link iTheme.changeTheme} */
  changeTheme(theme: Theme): void {
    return iTheme.changeTheme(this, theme);
  }
}
```

### hasTheme

Check if theme is available in ThemeManager.
The method has a default implementation.

```typescript
import iTheme from 'components/traits/i-theme/i-theme';
import iBlock, { component } from 'components/super/i-block/i-block';

@component()
export default class iStaticPage extends iBlock implements iTheme {
  /** {@link iTheme.changeTheme} */
  hasTheme(theme: Theme): void {
    return iTheme.hasTheme(this, theme);
  }
}
```
