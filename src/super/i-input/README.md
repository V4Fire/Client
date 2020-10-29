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

## Events

| Name                | Description                                                                                | Payload description                      | Payload                                         |
| ------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------------- | ----------------------------------------------- |
| `change`            | A value of the component has been changed                                                  | Component value                          | `this['Value']`                                 |
| `actionChange`      | A value of the component has been changed due to some user action                          | Component value                          | `this['Value']`                                 |
| `clear`             | A value of the component has been cleared via `clear`                                      | Component value                          | `this['Value']`                                 |
| `reset`             | A value of the component has been reset via `reset`                                        | Component value                          | `this['Value']`                                 |
| `validationStart`   | The component validation has been started                                                  | -                                        | -                                               |
| `validationSuccess` | The component validation has been successfully finished, i.e., the component is valid      | -                                        | -                                               |
| `validationFail`    | The component validation hasn't been successfully finished, i.e, the component isn't valid | Failed validation                        | `ValidationError<this['FormValue']>`            |
| `validationEnd`     | The component validation has been ended                                                    | Validation result \[, Failed validation] | `boolean`, `ValidationError<this['FormValue']>` |

Also, you can see [[iVisible]] and [[iAccess]] traits and the [[iData]] component.

## Associated types

The component has two associated types to specify types of an original value and form value.

* **Value** is the original component value.
* **FormValue** is the modified component value that will be sent from a form.

```typescript
import iInput, { component } from 'super/i-input/i-input';

export * from 'super/i-input/i-input';

@component()
export default class myInput extends iInput {
  /** @override */
  readonly Value!: string;

  /** @override */
  readonly FormValue!: Number;

  /** @override */
  readonly dataType: Function = parseInt;

  getMyValue(): this['Value'] {
    return this.value;
  }
}
```

## Form API

### Input props

#### Form control props

These props let you configure form control behaviour of the component. Also, check the [[iAccess]] trait.

##### id

An identifier of the form control.
You free to use this prop to connect the component with a label tag or other stuff.

```
< b-input :id = 'my-input'

< label for = my-input
  The input label
```

##### name

A string specifying a name for the form control.
This name is submitted along with the control's value when the form data is submitted.
If you don't provide the name, your component will be ignored by the form.
[See more](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefname)

```
< form
  < b-input :name = 'fname' | :value = 'Andrey'

  /// After pressing, the form generates an object to submit with values {fname: 'Andrey'}
  < button type = submit
    Submit
```

##### valueProp

Initial component value

```
< b-input :name = 'fname' | :value = 'Andrey'
```

##### defaultProp

Initial component default value.
This value will be used if the value prop is not specified or after invoking of `reset`.

```
< b-input :name = 'fname' | :value = name | :default = 'Anonymous'
```

##### form

A string specifying the `<form>` element with which the component is associated (that is, its form owner).
This string's value, if present, must match the id of a `<form>` element in the same document.
If this attribute isn't specified, the component is associated with the nearest containing form, if any.

The form prop lets you place a component anywhere in the document but have it included with a form elsewhere in the document.
[See more](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefform)

```
< b-input :name = 'fname' | :form = 'my-form'

< form id = my-form
  < button type = submit
    Submit
```

#### Validation

All instances of the iInput class support the feature of validation.
The validation process can be triggered manually via invoking the `validate` method or implicitly by a
form associated with the component.

Supported validators are placed within the static `validators` property.
This property is an object: the keys represent validator names; the values are specified as functions that take validation parameters and
return the `ValidatorResult` structure. Any validator can return a promise.

The iInput class provides out of the box only one validator: `required`.
You free to add new validator to your component.

```typescript
import iInput, { component } from 'super/i-input/i-input';

export * from 'super/i-input/i-input';

@component()
export default class myInput extends iInput {
  /** @override */
  readonly Value!: string;

  /** @override */
  readonly FormValue!: Number;

  /** @override */
  readonly dataType: Function = parseInt;

  /** @override */
  static validators: ValidatorsDecl = {
    // Inherit parent validation
    ...iInput.validators,

    async moreThan5({msg, showMsg = true}: ValidatorParams): Promise<ValidatorResult<boolean>> {
      if ((await this.formValue) < 5) {
        // This method is set a validation message to the component
        this.setValidationMsg(
          // This function returns a validation message based on the validation result, custom parameters, etc.
          this.getValidatorMsg(
            // Validation result: boolean or ValidatorError
            false,

            // User defined message (if specified).
            // Or an object with messages for each type of errors.
            // Or a function to invoke.
            msg,

            // Default message
            'The value should be more than 5'
          ),

          // We can deny output validation messages for each validator
          showMsg
        );

        return false;
      }

      return true;
    }
  };
}
```
