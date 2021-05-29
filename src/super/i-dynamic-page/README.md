# super/i-dynamic-page

This module provides a super component for all non-root page components.

## Synopsis

* The component is not used on its own. It is a superclass.

* The component sets the root `active` modifier on activation/deactivation.

* The component extends [[iPage]].

* By default, the root tag of the component is `<div>`.

## Modifiers

See the [[iPage]] component.

## Events

See the [[iPage]] component.

## Basic concepts

This class serves as a parent for all dynamic or virtual pages.
To understand the differences between static and dynamic pages, see the [[iPage]].

To create a dynamic page component, extend it from this component.
To bind a page to URL, see [[bRouter]] and [[bDynamicPage]] components.
