# core/kv-storage/engines/cookie

This module provides an engine for cookie-based "key-value" data storage.
Note that the engine stores all of its data in a single cookie, so the amount of information stored cannot exceed 4 kb.

## How is data stored inside a cookie?

When saving, the data is serialized into a string, where special separator characters are inserted between the keys and values.
