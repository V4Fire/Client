# core/cookies/storage

This module provides API to work with cookie with kv-storage like interface.

```js
import Storage from 'core/cookies';

const myStorage = new Storage('my-cookie-name');
myStorage.set('foo', 'bar');
console.log(myStorage.get('foo') === 'bar');

myStorage.remove('foo');
console.log(myStorage.has('foo') === false);
```

## Format

The data inside the cookie is stored in the format `key1.value1#key2.value2#key3.value3`

## Restrictions

Due to the format, it is forbidden to use special characters `# - hashtag` and `. - dot` in keys and values.
