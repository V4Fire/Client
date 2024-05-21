# core/session

This module offers an API for managing user sessions within a browser or in Node.js.
The API includes functions for authorizing/unauthorizing users, comparing different sessions,
and broadcasting session events.

The storage and retrieval of active sessions are handled by engines, which encapsulate the functionality.
By default, the session is stored in the browser's local storage and attached
to requests through the `Authorization` header.
You can add a new engine to use by placing it in the engine folder and exporting it from `engines/index.ts`.

In a simple web scenario, it is highly recommended to store session keys in `HTTP_ONLY` cookies.
This ensures that the session information is only accessible to the server
and cannot be modified by client-side scripts.
The remaining non-sensitive information, such as a hash of the session or a simple authentication predicate,
can be stored in the browser's local storage.

## When using within a browser

```js
import * as session from 'core/session';

session.emitter.on('set', ({auth, params}) => {
  console.log(`The session has been registered for ${auth}`);
  console.log(params);
});

(async () => {
  if (!await session.isExists()) {
    session.set('[[ANONYMOUS]]');
  }
})();
```

## When using within Node.js

```js
import { from } from 'core/session';

import * as cookies from 'core/cookies';
import CookieEngine from 'core/kv-storage/engines/cookie';

const sessionStore = new CookieEngine('my-cookie', {
  cookies: cookies.from(cookieJar),
  maxAge: (7).days()
});

const session = from(sessionStore);

session.emitter.on('set', ({auth, params}) => {
  console.log(`The session has been registered for ${auth}`);
  console.log(params);
});

(async () => {
  if (!await session.isExists()) {
    session.set('[[ANONYMOUS]]');
  }
})();
```

## Session information

The active session is stored in a special object of the following type.

```typescript
type SessionKey = Nullable<string | boolean>;

interface SessionDescriptor {
  /**
   * The session key or a simple predicate (authorized/non-authorized)
   */
  auth: SessionKey;

  /**
   * Additional session parameters, like user non-secure info, etc.
   */
  params?: Nullable<SessionParams>;
}
```

## Events

| EventName | Description                          | Payload description | Payload   |
|-----------|--------------------------------------|---------------------|-----------|
| `set`     | A new active session has been set    | Session information | `Session` |
| `clear`   | The current session has been cleared | -                   |           |

```js
import * as session from 'core/session';

session.emitter.on('set', ({auth, params}) => {
  console.log(`The session has been registered for ${auth}`);
  console.log(params);
});

session.emitter.on('clear', () => {
  console.log(`The current session has been cleared`);
});
```

## Getters

### emitter

The event emitter to broadcast session events.

## Functions

### from

Returns an API for managing the session of the specified store.

```js
import { from } from 'core/session';

import * as cookies from 'core/cookies';
import CookieEngine from 'core/kv-storage/engines/cookie';

const sessionStore = new CookieEngine('my-cookie', {
  cookies: cookies.from(cookieJar),
  maxAge: (7).days()
});

const session = from(sessionStore);

session.emitter.on('set', ({auth, params}) => {
  console.log(`The session has been registered for ${auth}`);
  console.log(params);
});

(async () => {
  if (!await session.isExists()) {
    session.set('[[ANONYMOUS]]');
  }
})();
```

### isExists

Returns true if the current session is already initialized.

```typescript
import * as session from 'core/session';

session.isExists().then((res: boolean) => {
  if (res) {
    alert('The session is exists!');
  }
});
```

### get

Returns information of the current session.

```typescript
import * as session from 'core/session';

session.get().then((session: Session) => {
  console.log(session);
});
```

### set

Sets a new session with the specified parameters.

```typescript
import * as session from 'core/session';

session.set('SECRET_SESSION_KEY', {csrf: 'SECRET_HEADER_TO_AVOID_CSRF'}).then((res: boolean) => {
  if (res) {
    alert('The session is set!');
  }
});
```

### clear

Clears the current session.

```typescript
import * as session from 'core/session';

session.clear().then((res: boolean) => {
  if (res) {
    alert('The session is cleared!');
  }
});
```

### match

Matches the passed session with the current one.

```typescript
import * as session from 'core/session';

session.match('SECRET_SESSION_KEY').then((res: boolean) => {
  if (res) {
    alert('The session is equal!');
  }
});
```
