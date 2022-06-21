# core/component/decorators/hook

Attaches a hook listener to a component method.
This means that when the component switches to the specified hook(s), the method will be called.

## Usage

```typescript
import iBlock, { component, hook } from 'super/i-block/i-block';

@component()
class bExample extends iBlock {
  // Adding a handler for one hook
  @hook('mounted')
  onMounted() {

  }

  // Adding a handler for several hooks
  @hook(['mounted', 'activated'])
  onMountedOrActivated() {

  }

  // Adding a handler for several hooks
  @hook('mounted')
  @hook('activated')
  onMountedOrActivated2() {

  }
}
```

## Additional options

### [after]

A method name or a list of names after which this handler should be invoked on a registered hook event.

```typescript
import iBlock, { component, hook } from 'super/i-block/i-block';

@component()
class bExample extends iBlock {
  @hook('mounted')
  initializeComponent() {

  }

  @hook({mounted: {after: 'initializeComponent'}})
  addedListeners() {

  }

  @hook({mounted: {after: ['initializeComponent', 'addedListeners']}})
  sendData() {

  }
}
```

### [functional = `true`]

If false, the registered hook handler won't work inside a functional component.
