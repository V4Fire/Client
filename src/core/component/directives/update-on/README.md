# core/component/directives/update-on

This module provides a directive to manual update an element by using various event(s) from various emitters.
You can add one or more reactions to one element, for example:

```
< .&__example v-update-on = [ &
  {
    emitter: parentEvent,
    event: 'foo',
    listener: (el, v) => onSampleEvent(el, v, false)
  },

  {
    emitter: rootEvent,
    event: 'bar',
    listener: (el, v) => onSampleEvent(el, v, true)
  }
] .
```

The template above attaches two event-listeners for two different emitters.
Use this directive if you want to update some parts of your template without re-render of a whole template or with functional components.
