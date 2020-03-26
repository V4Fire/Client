# directives/update-on

This directive is needed for manually updating elements at response to a various event(s) from various emitters. You can add one or more reactions to one element, for example:

```
 < .&__example v-update-on = [{ &
   emitter: parentEvent,
   event: 'foo',
   listener: (el, v) => onSampleEvent(el, v, false)
  }, {
   emitter: rootEvent,
   event: 'bar',
   listener: (el, v) => onSampleEvent(el, v, true)
 }] .
```

Template above adds two event listeners for two different emitters.
Use this directive if you want to point update some parts of your template.
