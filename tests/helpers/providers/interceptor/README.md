# tests/helpers/providers/interceptor

API that provides a simple way to intercept and respond to any request.

## Usage

```typescript
// Create a RequestInterceptor instance
const interceptor = new RequestInterceptor(page, /api/);

// Set a response for one request using a response handler function
interceptor.responseOnce(async (route, request) => {
  // Delay the response for 1 second
  await delay(1000);

  // Fulfill the request with a custom response
  return route.fulfill({
    status: 200,
    body: JSON.stringify({ message: 'Success' }),
    contentType: 'application/json'
  });
});

// Set a response for every request using a response status and payload
interceptor.response(500, { error: 'Server Error' });

// Start the request interception
await interceptor.start();

// Make a request to the intercepted route
const response = await page.goto('https://example.com/api/data');

// Log the response status
console.log(response.status()); // 200

// Log the response body
console.log(await response.json()); // { message: 'Success' }

// Stop the request interception
await interceptor.stop();
```

```typescript
// Create a RequestInterceptor instance
const interceptor = new RequestInterceptor(page, /api/);

// Set a response for one request using a response status and payload
interceptor.responseOnce(200, { message: 'OK' });

// Set a response for every request using a response handler function
interceptor.response(async (route, request) => {
  // Add a delay of 500 milliseconds to each response
  await delay(500);

  // Fulfill the request with a custom response
  return route.fulfill({
    status: 404,
    body: JSON.stringify({ error: 'Not Found' }),
    contentType: 'application/json'
  });
});

// Start the request interception
await interceptor.start();

// Make multiple requests to the intercepted route
const response1 = await page.goto('https://example.com/api/data');
const response2 = await page.goto('https://example.com/api/users');

// Log the response status
console.log(response1.status()); // 200
console.log(response2.status()); // 404

// Log the response body
console.log(await response1.json()); // { message: 'OK' }
console.log(await response2.json()); // { error: 'Not Found' }

// Stop the request interception
await interceptor.stop();
```

```typescript

// Create a RequestInterceptor instance
const interceptor = new RequestInterceptor(page, /api/);

// Set a response for one request using a response handler function
interceptor.responseOnce(async (route, request) => {
  // Delay the response for 1 second
  await delay(1000);

  // Fulfill the request with a custom response
  return route.fulfill({
    status: 200,
    body: JSON.stringify({ message: 'Success' }),
    contentType: 'application/json'
  });
});

// Set a response for every request using a response status and payload
interceptor.response(500, { error: 'Server Error' });

// Start the request interception
await interceptor.start();

// Make a request to the intercepted route
const response = await page.goto('https://example.com/api/data?param1=param1&chunkSize=12&id=tttt');

// Log the response status
console.log(response.status()); // 200

// Log the response body
console.log(await response.json()); // { message: 'Success' }

// Stop the request interception
await interceptor.stop();

const
  providerCalls = interceptor.mock.mock.calls,
  query = fromQueryString(new URL((<Route>providerCalls[0][0]).request().url()).search);

test.expect(providerCalls).toHaveLength(1);
test.expect(query).toEqual({
  param1: 'param1',
  chunkSize: 12,
  id: test.expect.anything()
});

```