## components/traits/i-history

This trait provides a history transition API for any component.

## Initializing of the index page

To initialize an index page, you should call the `initIndex` method with an optional `HistoryItem` argument.
The name of the index page is set to `index` by default.

## Creation of pages

The page system in the History class based on HTML data attributes.
Each page must have a unique string ID equal to the associated page route.

To create the main page and subpage templates, you can pass your markup to the default slot by following the rules:

* All page containers must have a `data-page` attribute with the specified page name value.

* All subpage containers must have a `data-sub-pages` attribute with no value.

* All page titles must have a `data-title` attribute with no value.

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

In this case, you can call the `history.push(key)` method of your history-based component to force a page transition with a name equal to `key`.
