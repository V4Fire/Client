# core/html/xss

This module provides an API for sanitizing and normalizing HTML content to prevent XSS vulnerabilities.

## Functions

### sanitize

Sanitizes the input string value from potentially harmful HTML.
This function uses the [DOMPurify](https://www.npmjs.com/package/dompurify) library to ensure a secure and clean output.

```js
import { sanitize } from 'core/html/xss';

// <button>Press on me!</button>
console.log(sanitize('<button onclick="javascript:void(console.log(document.cookie))">Press on me!</button>'));

// <button example="custom">Press on me!</button>
console.log(sanitize('<button example="custom">Press on me!</button>', {ADD_ATTR: ['example']}));
```
