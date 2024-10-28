<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [tests/helpers/network/interceptor](#testshelpersnetworkinterceptor)
  - [Usage](#usage)
    - [How to Initialize a Request Interceptor?](#how-to-initialize-a-request-interceptor)
    - [How to Respond to a Request Once?](#how-to-respond-to-a-request-once)
    - [How to Implement a Delay Before Responding?](#how-to-implement-a-delay-before-responding)
    - [How to Set a Custom Request Handler?](#how-to-set-a-custom-request-handler)
    - [How to View the Number of Intercepted Requests?](#how-to-view-the-number-of-intercepted-requests)
    - [How to View the Parameters of Intercepted Requests?](#how-to-view-the-parameters-of-intercepted-requests)
    - [How to Remove Previously Set Request Handlers?](#how-to-remove-previously-set-request-handlers)
    - [How to Stop Intercepting Requests?](#how-to-stop-intercepting-requests)
    - [How to Respond to Requests Using a Method Instead of Automatically?](#how-to-respond-to-requests-using-a-method-instead-of-automatically)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# tests/helpers/network/interceptor

This API allows you to intercept any request and respond to it with custom data.

## Usage

### How to Initialize a Request Interceptor?

To initialize a request interceptor, simply create an instance by calling its constructor. Provide the page or context as the first argument and the `url` you want to intercept as the second argument. The `url` can be either a string or a regular expression.

```typescript
// Create a RequestInterceptor instance
const interceptor = new RequestInterceptor(page, /api/);
```

However, after creating an instance of `RequestInterceptor`, request interceptions will not work until you do the following:

1. Set a response for the request using the `response` method:

   ```typescript
   // Create a RequestInterceptor instance
   const interceptor = new RequestInterceptor(page, /api/);

   // Set a response for the request using a response status and payload
   interceptor.response(200, { message: 'OK' });
   ```

2. Start intercepting requests using the `start` method:

   ```typescript
   // Create a RequestInterceptor instance
   const interceptor = new RequestInterceptor(page, /api/);

   // Set a response for the request using a response status and payload
   interceptor.response(200, { message: 'OK' });

   // Start intercepting requests
   await interceptor.start();
   ```

After these steps, every request that matches the specified regular expression will be intercepted, and a response with a status code of 200 and a response body containing an object with a `message` field will be sent.

### How to Respond to a Request Once?

To respond to a request only once, you can use the `responseOnce` method:

```typescript
// Create a RequestInterceptor instance
const interceptor = new RequestInterceptor(page, /api/);

// Set a response for the request using a response status and payload
interceptor.responseOnce(200, { message: 'OK' });

// Start intercepting requests
await interceptor.start();
```

This way, you can combine different response scenarios. For example, you can set the first request to respond with a status code of 500, the second with 404, and all others with 200:

```typescript
// Create a RequestInterceptor instance
const interceptor = new RequestInterceptor(page, /api/);

interceptor
  .responseOnce(500, { message: 'OK' })
  .responseOnce(404, { message: 'OK' })
  .response(200, { message: 'OK' });

// Start intercepting requests
await interceptor.start();
```

### How to Implement a Delay Before Responding?

`RequestInterceptor` provides an option to introduce a delay before responding. You can pass this delay as the third argument in the `response` method:

```typescript
// Create a RequestInterceptor instance
const interceptor = new RequestInterceptor(page, /api/);

// Set a response for the request using a response status, payload, and delay
interceptor.response(200, { message: 'OK' }, { delay: 200 });

// Start intercepting requests
await interceptor.start();
```

This delay causes a 200ms wait before sending a response to the request. Note that using `delay` in tests is generally not recommended, as it can slow down test execution. However, there are cases where it may be necessary, which is why this feature exists.

### How to Set a Custom Request Handler?

To set a custom request handler, pass a function instead of response parameters to the `response` method. This allows you to have full control over request interception.

```typescript
// Create a RequestInterceptor instance
const interceptor = new RequestInterceptor(page, /api/);

// Set a custom response handler for the request
interceptor.response((route: Route) => route.fulfill({ status: 200 }));

// Start intercepting requests
await interceptor.start();
```

### How to View the Number of Intercepted Requests?

Since `RequestInterceptor` uses the `jest-mock` API, you can access all the functionality provided by this API. To see the number of intercepted requests, you can access the `mock` property of the class and use the `jest-mock` API.

```typescript
// Create a RequestInterceptor instance
const interceptor = new RequestInterceptor(page, /api/);

// Set a response for the request using a response status and payload
interceptor.responseOnce(200, { message: 'OK' });

// Start intercepting requests
await interceptor.start();

// ...

// Logs the number of times interception occurred
console.log(interceptor.calls.length);
```

### How to View the Parameters of Intercepted Requests?

```typescript
// Create a RequestInterceptor instance
const interceptor = new RequestInterceptor(page, /api/);

// Set a response for the request using a response status and payload
interceptor.responseOnce(200, { message: 'OK' });

// Start intercepting requests
await interceptor.start();

// ...

const calls = provider.calls;
const query = fromQueryString(new URL((<Route>providerCalls[0][0]).request().url()).search);

// Logs the query parameters of the first intercepted request
console.log(query);

// Or a better way:

const firstRequest = interceptor.request(0); // Get the first request
// Or
const lastRequest = interceptor.request(-1); // Get the last request

// Get the query of the first request
const firstRequestQuery = firstRequest?.query();
```

### How to Remove Previously Set Request Handlers?

To remove handlers set using the `response` and `responseOnce` methods, you can use the `removeHandlers` method:

```typescript
// Create a RequestInterceptor instance
const interceptor = new RequestInterceptor(page, /api/);

// Set a response for the request using a response status and payload
interceptor.response(200, { message: 'OK' });

// Start intercepting requests
await interceptor.start();

// Remove all request handlers
interceptor.removeHandlers();
```

After calling `removeHandlers`, the handler set using the `response` method will no longer trigger.

### How to Stop Intercepting Requests?

To stop intercepting requests, use the `stop` method:

```typescript
// Create a RequestInterceptor instance
const interceptor = new RequestInterceptor(page, /api/);

// Set a response for the request using a response status and payload
interceptor.response(200, { message: 'OK' });

// Start intercepting requests
await interceptor.start();

// Stop intercepting requests
await interceptor.stop();
```

### How to Respond to Requests Using a Method Instead of Automatically?

Sometimes there are situations where you need to delay the moment of responding to a request for some unknown time in advance, and to solve this problem a special "responder" mode is provided.
In this mode, the `RequestInterceptor` still intercepts requests but does not automatically respond to them.
To respond to a request, you need to call a special method. Let's see how it works using an example:

```typescript
// Create a RequestInterceptor instance
const interceptor = new RequestInterceptor(page, /api/);

// Set a response for the request using a response status and payload
interceptor.response(200, { message: 'OK' });

// Transform the RequestInterceptor to the responder mode
await interceptor.responder();

// Start intercepting requests
await interceptor.start();

await sleep(2000);
await makeRequest();
await sleep(2000);

// Responds to the first request that was made
await interceptor.respond();
```
