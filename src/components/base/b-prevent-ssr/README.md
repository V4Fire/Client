# components/base/b-prevent-ssr

This module provides a wrapper component to prevent rendering during SSR. Mainly used with functional components.

## Synopsis

* The component extends [[iBlock]].

* The component is a wrapper for functional components.

* The component does not have a default UI.

## Basic concepts

To prevent the rendering of a component's content during server-side rendering (SSR), you should use the `ssrRendering` prop, setting it to `false`. However, this approach relies on modifying the value of a corresponding field, which is not applicable for functional components. Instead, you can use this component as a wrapper around a functional component to prevent its content from being rendered during SSR.

If required, an additional content can be passed to the `fallback` slot. It will be rendered if the `ssrRendering` field value is set to `false`.

## Slots

The component supports a couple of slots to provide.

1. `default` to provide the default content:

  ```
  < b-prevent-ssr
    < b-button
      Click on me!
  ```

2. `fallback` to provide a fallback content such as a loading indicator (skeleton):

  ```
  < b-prevent-ssr
    < b-button
      Click on me!

    < template #fallback
      += self.getTpl('b-skeleton/')('rect', {animation: 'm'}, {':style': ({width: '64px', height: '32px'}|json)})
  ```

## Props

### [ssrRenderingProp = false]

If `true`, the component will render the content, passed to the default slot. Otherwise, if a fallback content is passed to the `fallback` slot, it will be rendered instead.
In order for the component to function properly, this prop must be set to `false`. Therefore, it is not recommended to change its value.
