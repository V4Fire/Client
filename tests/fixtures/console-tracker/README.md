# tests/fixtures/console-tracker

The `ConsoleTracker` fixture is a utility designed for capturing and processing browser
console messages in tests conducted with Playwright.

It allows for selective tracking of console outputs based on configurable filters
and custom serialization functions.

## Usage

The fixture is integrated by default.
Below is a detailed guide on using the ConsoleTracker:

```ts
import { ConsoleMessage } from '@playwright/test';

test.describe('Example Module', () => {
  // Set up the ConsoleTracker before each test.
  test.beforeEach(({ consoleTracker }) => {
    // ConsoleTracker is initiated without any filters (i.e., it won't capture any messages initially).

    // Define your message filters
    consoleTracker.setMessageFilters({
      // Capture all messages containing "error" and save them as they are.
      error: null,

      // For messages containing "stderr:error", use a custom serializer to process and store them.
      'stderr:error': (msg: ConsoleMessage) => msg.args()[2].evaluate(
        (value) => value?.message ?? null
      ),
    });
  });

  test('Example Test', async ({ consoleTracker }) => {
    // Execute your test logic...

    // Assert that no errors have appeared in the console logs.
    await expect(consoleTracker.getMessages()).resolves.toHaveLength(0);
  });
});
```

## API

### setMessageFilters

Configures the ConsoleTracker to filter and possibly serialize
console messages based on specified conditions.

```ts
await consoleTracker.setMessageFilters({/* filter and serialization logic */});
```

#### Parameters

- `filters` (Object): A dictionary where the key is a substring to look for in console messages,
and the value is a serialization function or `null` if the message should be saved as-is.

### setLogPattern

This method serves as a wrapper for configuring the pattern used by `core/log`
to determine which messages should be emitted to the console.
By default, the logger is set to only log error messages.

Using `setLogPattern` allows you to choose a new pattern to capture more types
of console messages based on your testing needs.

```ts
await consoleTracker.setLogPattern(/.*/); // Logs all messages
```

#### Parameters:

- `pattern` (RegExp or string): A regular expression defining which messages should be logged to the console.

#### Example

If your tests require tracking of more specific messages, such as debug information alongside warnings and errors,
you could set a more inclusive pattern as follows:

```ts
// Configure the application's logger to capture debug, warning, and error messages.
await consoleTracker.setLogPattern(/(debug|warn|error)/i);

// Set message filters in the ConsoleTracker to save messages that match the specified keywords.
consoleTracker.setMessageFilters({
  debug: null,
  warn: null,
  error: null
});
```

## Tech Notes

1. Message filtering is case-insensitive.
2. Serialization functions should handle possible exceptions when evaluating message content
   to prevent test interruptions.
