# core/component/reflect

This module provides a set of functions that allow you to retrieve information about a component or
its properties based on its constructor and other parameters.

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
console.log(getComponentMods(getInfoFromConstructor(bButton)));
```

## API

### Constants

#### isSmartComponent

This regular expression can be used to determine whether a component is a "smart" component based on its name.

#### isAbstractComponent

This regular expression allows you to determine if a component is abstract based on its name.

### Functions

#### getComponentName

Returns a component's name based on the given constructor.
The name is returned in dash-separated format.

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

Returns an object containing information of the component property by the specified path.

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

Returns a dictionary containing normalized modifiers from the given component.
This function takes in the raw modifiers declaration, normalizes them, and merges them with the design system modifiers
if specified.

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
console.log(getComponentMods(getInfoFromConstructor()));
```
