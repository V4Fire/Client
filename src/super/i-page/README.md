# super/i-page

This module provides a super component for all page components.

## Synopsis

* The component is not used on its own. It is a superclass.

* The component sets the root `active` modifier on activation/deactivation.

* The component API doesn't support functional or flyweight components.

* The component extends [[iData]].

* The component implements the [[iVisible]] trait.

* By default, the root tag of the component is `<div>`.

## Modifiers

See the [[iVisible]] trait and the [[iData]] component.

## Events

See the [[iVisible]] trait and the [[iData]] component.

## Basic concepts

A page component is a special component kind represents a container bound to some URL.
Why would we need these containers? In a world of "static" websites, we have URL-s and HTML pages,
but nowadays, many sites transform to SPA. It means that physically we have only one HTML page, and all the rest pages are virtualized.
And this is a case when we use page components. They represent virtual analogs of static HTML pages.

But there is a case when we need the real static HTML page - it's an initialization page.
The initialization page contents the default HTML layout, like `head` and `body` tags. Also,
it loads core CSS and JS dependencies and does other initialization stuff. That's why `iPage` has two descendants:

1. [[iStaticPage]] - super component for static pages;
2. [[iDynamicPage]] - super component for dynamic or virtual pages.

So, when you want to create a new page, you should inherit from one of these, but not from  `iPage`.

## API

Also, you can see the implemented traits or the parent component.

### Props

#### [pageTitleProp]

An initial page title. Basically this title is set via `document.title`.

#### [stagePageTitles]

A dictionary of page titles (basically these titles are set via `document.title`). The dictionary values are tied
to the `stage` values. A key with the name `[[DEFAULT]]` is used by default. If a key value is defined as a function,
it will be invoked (the result will be used as a title).

```typescript
class bMyPage extends iPage {
  /** @override */
  stagePageTitles: StageTitles<this> = {
    '[[DEFAULT]]': 'Default title',
    profile: 'Profile page'
  }

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
  /** @override */
  stagePageTitles: StageTitles<this> = {
    '[[DEFAULT]]': 'Default title',
    profile: 'Profile page'
  }

  toProfile(): void {
    console.log(this.title === 'Default title');
    this.stage = 'profile';
  }
}
```

### Methods

#### scrollTo

Scrolls a page to the specified coordinates.

```typescript
class bMyPage extends iPage {
  toTop() {
    this.scrollTo({y: 0, behaviour: 'smooth'});
  }
}
```

#### scrollToProxy

A wrapped version of the `scrollTo` method. The calling cancels all previous tasks.
