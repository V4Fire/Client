# tests/helpers/component-object

The `ComponentObject` is a base class for testing components. The `component object` pattern allows for a more convenient way to interact with components in a testing environment.

This class can be used as a generic class for any component or can be extended to create a custom `component object` that implements methods for interacting with a specific component.

The class provides a universal API for generating a component and setting up mock functions and spy functions.

## Usage

### Builder

#### Basic

```typescript
import ComponentObjectBuilder from 'path/to/ComponentObjectBuilder';

class MyComponentObject extends ComponentObjectBuilder {
    // Implement specific methods and properties for interacting with the component during tests
}

// Create an instance of MyComponentObject
const myComponent = new MyComponentObject(page, 'MyComponent');

// Build the component
await myComponent.build();

// Access the component
const component = myComponent.component;

// Perform interactions with the component
await component.evaluate((ctx) => {
    // Perform actions on the component
});
```

### Mock

#### Basic

```typescript
import ComponentObject from 'path/to/component-object';

class MyComponentObject extends ComponentObject {
    // Implement specific methods and properties for testing the component in a mock environment
}

// Create an instance of MyComponentObject
const myComponent = new MyComponentObject(page, 'MyComponent');

// Create a spy
const spy = await myComponent.spyOn('someMethod');

// Access the component
const component = myComponent.component;

// Perform interactions with the component
await component.evaluate((ctx) => {
    // Perform actions on the component
});

// Access the spy
console.log(await spy.calls);

// Create a mock function
const mockFn = await myComponent.mockFn((arg) => {
    // Mock function logic
});
```

#### Spy on emitter

```typescript
import ComponentObject from 'path/to/component-object';

class MyComponentObject extends ComponentObject {
    // Implement specific methods and properties for testing the component in a mock environment
}

// Create an instance of MyComponentObject
const myComponent = new MyComponentObject(page, 'MyComponent');

// Create a spy
myComponent.setProps({
  '@hook:beforeDataCreate': (ctx) => jest.spy(ctx, 'emit')
});

// Access the component
const component = myComponent.component;

// Perform interactions with the component
await component.evaluate((ctx) => {
    // Perform actions on the component
});

// Access the spy
const
  spy = await myComponent.getSpy((ctx) => ctx.emit)

console.log(await spy.calls);
```

It is important to understand that spy and mock functions store references, not copies, in their `calls` property.

```typescript
class Component {
  currentState: Dictionary = {};
  onStateUpdate: (state: Dictionary) => void;

  get state() {
    this.currentState;
  }

  constructor(onStateUpdate: (state: Dictionary) => void) {
    this.onStateUpdate = onStateUpdate;
  }

  updateState() {
    this.currentState.val = this.currentState.val ?? 0;
    this.currentState.val++;
    this.onStateUpdate(this.state);
  }
}


const
  mock = jestMock.mock((state) => console.log('state update', state));
  c = new Component(mock);

c.updateState();
c.updateState();

console.log(mock.mock.calls); // [[{val: 2}, {val: 2}]]
```