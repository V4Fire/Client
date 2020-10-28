# super/i-input

This module provides a super component for all form components.

## Synopsis

* The component is not used on its own. It is a superclass.

* The component extends [[iData]].

* The component implements [[iVisible]], [[iAccess]] traits.

## Basic concepts

Like, input or checkbox, every form components have a core with a similar set of properties and methods:
form attributes, validators, etc. This class provides this core, i.e., if you want your component to work as a form component,
you should inherit it from this.

```typescript
import iInput, { component } from 'super/i-input/i-input';

export * from 'super/i-input/i-input';

@component()
export default class myInput extends iInput {
  /** @override */
  readonly Value!: string;

  /** @override */
  readonly FormValue!: string;

  /** @override */
  protected readonly $refs!: {input: HTMLInputElement};
}
```

## Modifiers

| Name        | Description                                                                                                            | Values    | Default |
| ----------- | ---------------------------------------------------------------------------------------------------------------------- | ----------| ------- |
| `form`      | The system modifier. Is used to find form components from DOM.                                                         | `Boolean` | `true`  |
| `valid`     | The component passed data validation                                                                                   | `Boolean` | -       |
| `showInfo`  | The component is showing some info message (like advices to generate a password) through output                        | `Boolean` | -       |
| `showError` | The component is showing some error message (like using of non-valid characters to generate a password) through output | `Boolean` | -       |

Also, you can see [[iVisible]] and [[iAccess]] traits and the [[iData]] component.

## Form API

### Input props

#### Form control attributes

##### id

An identifier of the form control. You can use this prop to connect different components and tags.

```
< b-input :id = 'my-input'

< label for = my-input
  The input label
```

##### name

A string specifying a name for the form control.
This name is submitted along with the control's value when the form data is submitted.
If you don't provide the name, your component will be ignored by the form.

```
< form
  < b-input :name = 'fname' | :value = 'Andrey'

  /// After pressing, the form generates an object to submit with values {fname: 'Andrey'}
  < button type = submit
    Submit
```

##### form

A string specifying the `<form>` element with which the component is associated (that is, its form owner).
This string's value, if present, must match the id of a `<form>` element in the same document.
If this attribute isn't specified, the component element is associated with the nearest containing form, if any.

The form prop lets you place an input anywhere in the document but have it included with a form elsewhere in the document.

```
< b-input :name = 'fname' | :form = 'my-form'

< form id = my-form
  < button type = submit
    Submit
```
