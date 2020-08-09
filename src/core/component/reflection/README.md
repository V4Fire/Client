# core/component/reflection

This module provides a bunch of function to reflect component classes.

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
