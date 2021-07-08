# traits/i-control-list

This module provides a trait for a component that renders a list of controls.

## Synopsis

* This module provides an abstract class, not a component.

* The trait contains TS logic.

* The trait provides a helper template.

## Methods

The trait specifies a bunch of methods.

### getControlEvent

Returns an event name to handle for the specified control.

__b-dummy-control-list.ts__

```typescript
import { derive } from 'core/functools/trait';

import iControlList, { Control } from 'traits/i-control-list/i-control-list';
import iBlock, { component, prop } from 'super/i-block/i-block';

export * from 'super/i-block/i-block';

interface bDummyControlList extends
  Trait<typeof iControlList> {}

@component({
  functional: {
    functional: true,
    dataProvider: undefined
  }
})

@derive(iControlList)
class bDummyControlList extends iBlock implements iControlList {
  /**
   * Group of controls to render
   */
  @prop(Array)
  controls!: Control[];

  /**
   * @override
   * @see [[iControlList.prototype.getControlEvent]]
   */
  getControlEvent(opts: Control): string {
    if (opts.component === 'b-some-my-component') {
      return 'myEventName';
    }

    return iControlList.getControlEvent(this, opts);
  }
}
```

__b-dummy-control-list.ss__

```snakeskin
< template v-if = controls
  < .&__primary-control
    < component &
      v-func = false |
      :v-attrs = {...controls[0].attrs} |
      :is = controls[0].component || 'b-button' |
      :instanceOf = bButton |
      @[getControlEvent(controls[0])] = callControlAction(controls[0], ...arguments)
    .
      {{ controls[0].text }}
```

### callControlAction

Calls an event handler for the specified control.

```snakeskin
< template v-if = controls
  < .&__primary-control
    < component &
      v-func = false |
      :v-attrs = {...controls[0].attrs} |
      :is = controls[0].component || 'b-button' |
      :instanceOf = bButton |
      @[getControlEvent(controls[0])] = callControlAction(controls[0], ...arguments)
    .
      {{ controls[0].text }}
```

## Helpers

### Template

The trait also defines a base template for creating a controls list.

```snakeskin
- namespace [%fileName%]

- include 'super/i-block'|b as placeholder
- include 'traits/i-control-list'|b


- template index() extends ['i-block'].index
  - block body
    += self.getTpl('i-control-list/')({ &
      from: 'controls',
      elClasses: 'control',
      wrapperClasses: 'control-wrapper'
    }) .
```