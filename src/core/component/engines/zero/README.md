# core/component/engines/zero

This module provides an adaptor to render components without any MVVM libraries, like Vue.js or React.
The adaptor can be helpful for SSR or simple landings. Obviously, such features, like data-binding and automatically
re-rendering not working with this adaptor.

```js
import ZeroEngine from 'core/component/engines/zero';

// {ctx: {...}, node: Node}
console.log(await ZeroEngine.render('b-input', {value: 'Hello world'}));
```
