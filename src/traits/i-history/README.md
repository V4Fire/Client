## traits/i-history

This trait provides history transition API for any component.

To turn on the functionality, you need to create the `History` class instance within your component.
Now, you can access the current history item and control transitions.

## Initializing of the index page

To initialize an index page, you should call the `initIndex` method with an optional argument of the `HistoryItem` type.
The name of the index page is set to `index` by default.

## Creation of pages

Page system at the History class based on HTML data attributes. Every page should have the unique string identifier,
which is equal to the tied page route.

To create the main page and subpage templates, you can pass your markup into the default slot by following rules:

* All page containers need to have the `data-page` attribute with the provided page name value.

* All containers with subpages need to have the `data-sub-pages` attribute without any value.

* All page titles need to have the `data-title` attribute without any value.

For example:

```
< .&__index -page = index
  < .&__title -title
    Index page title

< .&__pages -sub-pages
  < .&__page &
    v-for = page, key in pages |
    :-page = key
  .
```

In this case, to emit the transition of a page with the name that is equal to `key,` you can call the method `history.push(key)` of your history-based component.
