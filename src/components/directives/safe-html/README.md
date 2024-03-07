# core/component/directives/safe-html

[Changelog](./CHANGELOG.md)

This module provides a directive that serves as a safe
alternative to v-html (https://vuejs.org/api/built-in-directives.html#v-html),
it inserts sanitized HTML using dompurify (https://github.com/cure53/DOMPurify).

## Usage

```
< .&__test v-safe-html = someStringWithHtml
```

## Options

Along with the directive call, you can additionally pass any settings supported by [dompurify](https://github.com/cure53/DOMPurify),
except for `RETURN_DOM_FRAGMENT` and `RETURN_DOM`.

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
