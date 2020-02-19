# core/component/flyweight

This module provides API to create a flyweight component. The flyweight components is a component that borrows a context
from its parent and injects own render function to the parent render function. The constructed component is stateless and this mechanism is pretty similar to "functional component" API in some MVVM libraries, but provides more flexible API.
