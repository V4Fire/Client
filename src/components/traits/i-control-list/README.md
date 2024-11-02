# components/traits/i-control-list

This module provides a trait with helpers for a component that renders a list of controls.

## Synopsis

* This module provides an abstract class, not a component.

* The trait contains TS logic.

* The trait provides a template helper.

* The trait can be automatically derived.

  ```typescript
  import { derive } from 'components/traits';

  import iControlList, { Control } from 'components/traits/i-control-list/i-control-list';
  import iBlock, { component } from 'components/super/i-block/i-block';

  interface bExample extends Trait<typeof iControlList> {}

  @component()
  @derive(iControlList)
  class bExample extends iBlock implements iControlList {
    getControlEvent(opts: Control): string {
      return opts.component === 'b-button' ? 'click' : 'change';
    }
  }

  export default bExample;
  ```

## Methods

The trait specifies a bunch of methods to implement.

### getControlEvent

Returns an event name to handle for the specified control.

```typescript
import iControlList, { Control } from 'components/traits/i-control-list/i-control-list';
import iBlock, { component } from 'components/super/i-block/i-block';

@component()
export default class bExample implements iControlList {
  getControlEvent(opts: Control): string {
    return opts.component === 'b-button' ? 'click' : 'change';
  }
}
```

### callControlAction

Calls an event handler for the specified control.
The method has a default implementation.

```typescript
import iControlList, { Control, ControlEvent } from 'components/traits/i-control-list/i-control-list';
import iBlock, { component } from 'components/super/i-block/i-block';

@component()
export default class bExample implements iControlList {
  getControlEvent(opts: Control): string {
    return opts.component === 'b-button' ? 'click' : 'change';
  }

  /** {@link iOpen.iControlList} */
  callControlAction(opts: ControlEvent, ...args: unknown[]): string {
    return iControlList.callControlAction(this, opts, ...args);
  }
}
```

```
< template v-if = controls
  < .control v-for = control of controls
    < component &
      v-attrs = control.attrs |
      @[getControlEvent(control)] = callControlAction(control, ...arguments)
    .
      {{ control.text }}
```

## Helpers

The trait also defines a helper to render a list of controls.

```
- namespace [%fileName%]

- include 'components/super/i-block'|b as placeholder
- include 'components/traits/i-control-list'|b

- template index() extends ['i-block'].index
  - block body
    /**
     * Generates a layout for controls
     *
     * @param {object} params - additional parameters:
     *   *) [from] - an Iterable with data to render controls
     *   *) [component] - the component name within which the controls are rendered (taken from the context by default)
     *   *) [controlClasses] - CSS classes for control elements
     *   *) [wrapper] - a tag that will wrap the control elements
     *   *) [wrapperClasses] - CSS classes for elements that wrap controls
     *
     * @param {string} [content] - slot content for control elements
     */
    += self.getTpl('i-control-list/')({ &
      from: 'controls',
      elClasses: 'control',
      wrapper: 'div',
      wrapperClasses: 'control-wrapper'
    }) .
```
