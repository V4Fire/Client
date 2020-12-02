# core/session

This module provides API to work with a user session. The API contains functions to authorize/unauthorize, compare different sessions and broadcast session events.

```js
import * as session from 'core/session';

session.emitter.on('set', ({auth, params}) => {
  console.log(`Session was registered with for ${auth}`);
  console.log(params);
});

(async () => {
  if (!await session.isExists()) {
    session.set('[[ANONYMOUS]]');
  }
})();
```
