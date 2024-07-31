# core/cookies/decorators/with-idempotency

This module provides a decorator for a cookie store.
It adds idempotent behavior to the cookie store, ensuring that a cookie is not overwritten if it already exists with the same name and value.
This prevents unnecessary updates and ensures consistency, especially in environments like SSR (Server-Side Rendering), where cookies set on the server should not be redundantly re-applied on the client.
