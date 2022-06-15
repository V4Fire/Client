# core/component/reflect

This module provides a bunch of functions to reflect component classes.

## Usage

```js
@component()
class bButton extends iBlock {
  static mods = {
    'opened-window': [
      true,
      false,
      undefined,
      [false],
      bButton.PARENT
    ]
  };
}

// {openedWindow: ['true', ['false'], bButton.PARENT]}
getComponentMods(getInfoFromConstructor());
```

## API

### Constants

#### isSmartComponent

A RegExp to check if the component name has the "smart" postfix

#### isAbstractComponent

A RegExp to check if the component name is abstract.

### Functions

#### getInfoFromConstructor

Returns an object with information from the specified component constructor.

```js
@component({functional: true})
class bButton extends iBlock {

}

// {
//   name: 'b-button',
//   componentName: 'b-button',
//   parent: iBlock,
//   ...
// }
console.log(getInfoFromConstructor(bButton));
```

#### getPropertyInfo

Returns an information object of a component property by the specified path.

```js
@component()
class bButton {
  @system()
  fooStore = {bla: 'bar'};

  get foo() {
    return this.fooStore;
  }

  created() {
    // {
    //   name: 'fooStore',
    //   path: 'fooStore.bar',
    //   fullPath: '$root.$refs.button.fooStore.bar',
    //   topPath: '$root.$refs.button.fooStore',
    //   originalPath: '$root.$refs.button.foo.bar',
    //   originalTopPath: '$root.$refs.button.foo',
    //   type: 'system',
    //   accessor: 'foo',
    //   accessorType: 'computed'
    // }
    console.log(getPropertyInfo('$root.$refs.button.foo.bar', this));
  }
}
```

#### getComponentMods

Returns a dictionary with modifiers from the specified component.
This function takes the raw declaration of modifiers, normalizes it, and mixes with the design system modifiers (if there are specified).

```js
@component()
class bButton extends iBlock {
  static mods = {
    'opened-window': [
      true,
      false,
      undefined,
      [false],
      bButton.PARENT
    ]
  };
}

// {openedWindow: ['true', ['false'], bButton.PARENT]}
getComponentMods(getInfoFromConstructor());
```
