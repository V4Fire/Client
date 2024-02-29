# core/component/directives/safe-html

[Changelog](./CHANGELOG.md)

A directive is a safe alternative to [v-html](https://vuejs.org/api/built-in-directives.html#v-html) inserting sanitized HTML by [dompurify](https://github.com/cure53/DOMPurify)

## Usage

```
< .&__test v-safe-html = someStringWithHtml
```

or with options

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

## Options
All options are supported by [dompurify](https://github.com/cure53/DOMPurify), except for `RETURN_DOM_FRAGMENT` and `RETURN_DOM`, due to the fact that this directive inserts only strings.
