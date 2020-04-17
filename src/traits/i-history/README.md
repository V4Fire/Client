## traits/i-history
This trait provides history transitions for any component.
To turn on functionality you need to create `History` class instance with your component as first and only argument. Now, you can access to current history item and control transitions.

## Initialize index page
For initializing an index page, you should call `initIndex` method with optional argument with type `HistoryItem`. History class initialize page with name `index` by default, if argument is not specified.

## Creating pages
Page system at the History class based on html data attributes. Every page should have unique string identifier, which is equal page route.
For creating a main page and subpages templates, you can pass your markup into default slot by following rules:
* Page containers should have `data-page` attribute with page name value
* Container with subpages should have `data-sub-pages` attribute without value
* Page titles should have `data-title` attribute without value

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

In this case, for transition to page with name equals `key` you can call method `history.push(key)` of your history-based component.
