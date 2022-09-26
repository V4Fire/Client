# core/session

This module provides an API to work with a user session. The API contains functions to authorize/unauthorize,
compare different sessions and broadcast session events.

The way how to store and extract the active session is encapsulated within engines. By default, the session is stored within a
browser local storage and is attached to requests via the `Authorization` header. You can add a new engine to use.
Just put it in the `engine` folder and export it from `engines/index.ts`.

In a simple web case, we strongly recommend storing session keys within the `HTTP_ONLY` cookies.
Then, the rest of the non-secure information, like a hash of the session or simple auth predicate,
can be stored in a browser's local storage.

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

## Session information

The active session is stored in a special object of the following type.

```typescript
type SessionKey = Nullable<string | boolean>;

interface Session {
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
  console.log(`A session has been registered with for ${auth}`);
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

session.set('Secret session key', {csrf: 'Secret header to avoid CSRF'}).then((res: boolean) => {
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

Matches the passed session with the current.

```typescript
import * as session from 'core/session';

session.match('Secret session key').then((res: boolean) => {
  if (res) {
    alert('The session is equal!');
  }
});
```
