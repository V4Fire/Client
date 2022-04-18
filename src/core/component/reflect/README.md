# core/component/reflect

This module provides a bunch of functions to reflect component classes.

```js
@component()
class bButton extends iBlock {
  static mods = {
    'opened-window': [
      true,
      false,
      undefined,
      [false],
      bButton.PARENT
    ]
  };
}

// {openedWindow: ['true', ['false'], bButton.PARENT]}
getComponentMods(getInfoFromConstructor());
```
