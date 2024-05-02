# components/base/b-prevent-ssr

This module provides a wrapper component that prevents rendering during SSR,
primarily used with functional components.

## Synopsis

* The component extends [[iBlock]].

* The component is a wrapper for functional components.

* The component does not have a default UI.

## Basic concepts

To suppress the rendering of a component's content during SSR, use the `ssrRendering` prop and set it to false.
This method changes the value of a corresponding field, which cannot be applied to functional components.
For functional components, use this wrapper component to prevent content rendering during SSR.

Additionally, if necessary, content can be passed to the `fallback` slot,
which will be rendered if the `ssrRendering` field value is set to false.

## Slots

The component supports a couple of slots to provide.

1. `default` to provide the default content:

   ```
   < b-prevent-ssr
     < b-button
       Click on me!
   ```

2. `fallback` to provide a fallback content such as a loading indicator or a skeleton:

   ```
   < b-prevent-ssr
     < b-button
       Click on me!

     < template #fallback
       += self.getTpl('b-skeleton/')('rect', {animation: 'm'}, {':style': ({width: '64px', height: '32px'}|json)})
   ```
