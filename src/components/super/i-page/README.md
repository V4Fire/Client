# components/super/i-page

This module provides a superclass for all page components.

## Synopsis

* The component is not used on its own. It is a superclass.

* The component sets the root `active` modifier on activation/deactivation.

* The component extends [[iData]].

* The component implements the [[iVisible]] trait.

* By default, the component's root tag is set to `<div>`.

## Modifiers

See the [[iVisible]] trait and the [[iData]] component.

## Events

See the [[iVisible]] trait and the [[iData]] component.

## Basic concepts

A page component is a special component kind represents a container bound to some URL.
Why would we need these containers? In the world of "static" websites, we have URLs and HTML pages,
but nowadays, many sites are being transformed into SPAs. This means that physically we have only one HTML page,
and all other pages are virtualized. This is the case when we use page components. They are virtual counterparts of static HTML pages.

But there is one more case where we need a real static HTML page, which is the initialization page or the root page.
The initialization page contains the default HTML layout, such as `head` and `body` tags. In addition, it loads the main
CSS and JS dependencies and performs other initialization steps. That's why `iPage` has two descendants:

1. [[iStaticPage]] - a superclass for static pages;
2. [[iDynamicPage]] - a superclass for dynamic or virtual pages.

So, when you want to create a new page, you must inherit from one of these, not `iPage`.

## API

Additionally, you can view the implemented traits or the parent component.

### Props

#### [pageTitleProp]

The current page title.
Basically this title is set via `document.title`.

If the prop value is defined as a function, it will be called (the result will be used as the title).

#### [pageDescriptionProp]

The current page description.
Basically this description is set via `<meta name="description" content="..."/>`.

If the prop value is defined as a function, it will be called (the result will be used as the description content).

#### [stagePageTitles]

A dictionary of page titles (basically these titles are set via `document.title`).
The dictionary values are bound to the `stage` values.

The key named `[[DEFAULT]]` is used by default. If the key value is defined as a function,
it will be called (the result will be used as the title).

```typescript
class bMyPage extends iPage {
  override readonly stagePageTitles: StageTitles<this> = {
    '[[DEFAULT]]': 'Default title',
    profile: 'Profile page'
  };

  toProfile(): void {
    this.stage = 'profile';
  }
}
```

### Fields

#### pageTitle

The current page title.

```typescript
class bMyPage extends iPage {
  override readonly stagePageTitles: StageTitles<this> = {
    '[[DEFAULT]]': 'Default title',
    profile: 'Profile page'
  };

  toProfile(): void {
    console.log(this.title === 'Default title');
    this.stage = 'profile';
  }
}
```

### Methods

#### scrollTo

Scrolls the page to the specified coordinates.
The scrolling can be done by specified coordinates (x, y) or by specified options.

```typescript
class bMyPage extends iPage {
  toTop(): void {
    this.scrollTo({y: 0, behavior: 'smooth'});
  }
}
```

#### scrollToProxy

A wrapped version of the `scrollTo` method.
The calling cancels all previous tasks.
