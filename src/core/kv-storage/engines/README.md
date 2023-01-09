# core/kv-storage/engines

This module provides engines for kv-storage.

## CookieStorageEngine

Cookie Storage Engine - uses a cookie as a container for data.

When creating the engine, you will have to pass the name of the cookie. This cookie will be the source of the truth, all changes to the data will be recorded in it, and when accessing the data, they will be obtained from this cookie.

### Usage

Example of creating an engine that will use the `my-cookie-name` cookie as a data source

```typescript
const engine = new CookieStorageEngine('my-cookie-name');
```

### Restrictions

Due to the fact that we use cookies as a data container, we get the same restrictions as cookies. Namely, the limit in the maximum size of raw data in 4 kb.

Therefore, when using this engine, it is very important to monitor the data that you write to the storage and try to add new ones only when necessary.

The following separators are used to serialize data:

`{{.}}` - key/value separtor

`{{#}}` - keys separators

It is forbidden to use these symbols in keys and values.
