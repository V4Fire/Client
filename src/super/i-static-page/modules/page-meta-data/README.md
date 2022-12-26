# super/i-static-page/modules/page-meta-data

This module provides API for working with meta data of page.

# What is the meta data of the page

These are page elements that help the search robot understand what is on the page.
The better the search robot recognizes what is on the page, the better the SEO metrics.

# What tags is the robot looking at

Tags meta, link, title and meta tag with name description.

# How to use

This module provides a class that is friendly to `i-static-page` component.
You can call this module from any component with `this.r.PageMetaData`.

For example change the title of page:

```typescript
this.r.PageMetaData.title = 'New title of page'
```

Or adding new meta tag:

```typescript
this.r.PageMetaData.addMeta({name: 'robots', content: 'noindex'});
```
