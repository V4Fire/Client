# core/kv-storage/engines/cookie

This module provides cookie engine for kv-storage.

## CookieStorageEngine

Cookie Storage Engine - uses a cookie as a container for data.

This cookie will be the source of the truth, all changes to the data will be recorded in it, and when accessing the data, they will be obtained from this cookie.

### Restrictions

All data is stored in one cookie.

Due to the fact that we use cookies as a data container, we get the same restrictions as cookies. Namely, the limit in the maximum size of raw data in 4 kb.

Therefore, when using this engine, it is very important to monitor the data that you write to the storage and try to add new ones only when necessary.

The following separators are used to serialize data:

`{{.}}` - key/value separtor

`{{#}}` - keys separators

It is forbidden to use these symbols in keys and values.
