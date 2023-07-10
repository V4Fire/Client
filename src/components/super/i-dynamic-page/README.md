# components/super/i-dynamic-page

This module provides a superclass for all non-root page components.

## Synopsis

* The component is not used on its own. It is a superclass.

* The component sets the root `active` modifier on activation/deactivation.

* The component extends [[iPage]].

* By default, the component's root tag is set to `<main>`.

## Modifiers

See the [[iPage]] component.

## Events

See the [[iPage]] component.

## Basic concepts

This class serves as the parent for all dynamic or virtual pages.
To understand the difference between static and dynamic pages, see the [[iPage]].

To create a dynamic page component, derive it from this component.
To bind a page to URL, see [[bRouter]] and [[bDynamicPage]] components.
