# core/component/directives/safe-html

[Changelog](./CHANGELOG.md)

This module provides a directive that serves as a secure
alternative to [v-html](https://vuejs.org/api/built-in-directives.html#v-html).
It uses the `core/html/xss` module, based on [dompurify](https://github.com/cure53/DOMPurify),
to insert sanitized HTML safely.

## Usage

```
< .&__test v-safe-html = someStringWithHtml
```

## Options

Along with the directive call, you can additionally pass any settings
supported by [dompurify](https://github.com/cure53/DOMPurify), except for `RETURN_DOM_FRAGMENT` and `RETURN_DOM`.

```
< .&__test &
  v-safe-html = {
    value: someStringWithHtml,
    options: {
      USE_PROFILES: {
        html: true,
        svg: true,
        mathMl: true
      }
    }
  }
.
```
