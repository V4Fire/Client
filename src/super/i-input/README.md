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

Also, you can see the parent component.

## Model

All instances of the `iInput` class can be used with the `v-model` directive.

```
< b-input v-model = value
```

```js
({
  model: {
    prop: 'valueProp',
    event: 'onChange'
  }
})
```

## API

Also, you can see [[iVisible]] and [[iAccess]] traits and the [[iData]] component.

### Props

#### id

An identifier of the form control.
You free to use this prop to connect the component with a label tag or other stuff.

```
< b-input :id = 'my-input'

< label for = my-input
  The input label
```

#### name

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

#### valueProp

Initial component value

```
< b-input :name = 'fname' | :value = 'Andrey'
```

#### defaultProp

Initial component default value.
This value will be used if the value prop is not specified or after invoking of `reset`.

```
< b-input :name = 'fname' | :value = name | :default = 'Anonymous'
```

#### form

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

#### inputAttrs

Additional attributes are provided to an "internal" (native) input tag.

#### cache

A Boolean value that enables or disables caching of a component value by the associated form.
The caching is mean that if the component value doesn't change since the last sending of the form, it won't be sent again.

#### disallow

Component values are not allowed to send via a form.
If a component value matches with one of the denied conditions, the form value will be equal to undefined.

The parameter can take a value or list of values to ban.
Also, the parameter can be passed as a function or regular expression.

```
/// Disallow values that contain only whitespaces
< b-input :name = 'name' | :disallow = /^\s*$/
```

#### formValueConverter

Converter/s of the original component value to a form value.

You can provide one or more functions to convert the original value to a new form value.
For instance, you have an input component. The input's original value is string, but you provide a function
to parse this string into a data object.

```
< b-input :formValueConverter = toDate
```

To provide more than one function, use the array form. Functions from the array are invoked from
the "left-to-right".

```
< b-input :formValueConverter = [toDate, toUTC]
```

Any converter can return a promise (). In the case of a list of converters,
they are waiting to resolve the previous invoking.

Also, any converter can return the `Maybe` monad (all errors transform to undefined).
It helps to combine validators and converters.

```
< b-input :formValueConverter = [toDate.option(), toUTC.option()]
```

#### formConverter

Converter/s that is/are used by the associated form.
The form applies these converters to the group form value of the component.

To provide more than one function, use the array form. Functions from the array are invoked from
the "left-to-right".

```
< b-input :formConverter = [toProtobuf, zip]
```

Any converter can return a promise. In the case of a list of converters,
they are waiting to resolve the previous invoking.

Also, any converter can return the `Maybe` monad (all errors transform to undefined).
It helps to combine validators and converters.

```
< b-input :validators = ['required'] | :formConverter = [toProtobuf.option(), zip.option()]
```

### Validation

All instances of the `iInput` class support the feature of validation.
The validation process can be triggered manually via invoking the `validate` method or implicitly by a
form associated with the component.

To specify validators to a component, use the `validators` prop. The prop takes an array of strings (validator names).

```
< b-input :validators = ['required', 'validUserName']
```

Also, you can set additional parameters for each validator.

```
< b-input :validators = [ &
  // To provide parameters you can use an array form
  ['required', {msg: 'This is required field!'}],

  // Or an object form
  {validUserName: {showMsg: false}}
] .
```

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
      if ((await this.formValue) <= 5) {
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

#### Automatic validation

By default, the validation process is automatically started on the `actionChange` event.
This event fires only when a user changes the component value manually.

```
/// Every time a user types some value into the component, the component will invoke validation
< b-input :validators = ['required', 'email']
```

### info/error messages

To output information about warnings and errors, descendants of `iInput` can use `infoProp/info` and `errorProp/error` properties.

```
< b-input :info = 'This is required field'
```

You can put these properties somewhere in your component template, OR if you activate `messageHelpers` to `true`,
the layout will be generated automatically: all you have to do is write the CSS rules.

```
< b-input :info = 'This is required field' | :messageHelpers = true
```

### Fields and getters

#### value

The original component value. It can be modified directly from a component.

#### default

The default value of a component. It can be modified directly from a component.
This value will be used after invoking of `reset`.

#### formValue

A form value of the component.

By design, all `iInput` components have "own" value and "form" value.
The form value is based on the own component value, but they are equal in a simple case.
The form associated with this component will use the form value, but not the original.

This value is tested by parameters from `disallow`. If the value doesn't match allowing parameters,
it will be skipped (the getter returns undefined). The value that passed the validation is converted
via `formValueConverter` (if it's specified).

The getter always returns a promise.

#### groupFormValue

A list of form values. The values are taken from components with the same `name` prop and
which are associated with the same form.

The getter always returns a promise.

#### groupElements

A list of components with the same `name` prop and associated with the same form

### Methods

#### clear

Clears the component value to undefined.

#### reset

Resets the component value to default.

#### validate

Validates a component value.

### Template methods

#### nativeInput/hiddenInput

These blocks generate native input tags with predefined attributes. You can use it to shim the native behavior of the component.
You can also manage a type of the created tag and other options by using the predefined constants.

```
- nativeInputTag = 'input'
- nativeInputType = "'hidden'"
- nativeInputModel = 'valueStore'

/**
 * Generates a native form input
 *
 * @param [params] - additional parameters:
 *   *) [tag=nativeInputTag] - name of the generated tag
 *   *) [elName='input'] - element name of the generated tag
 *   *) [ref='input'] - ref attribute
 *   *) [model=nativeInputModel] - v-model attribute
 *   *) [type=nativeInputType] - type attribute
 *   *) [attrs] - dictionary with additional attributes
 */
- block nativeInput(@params = {})
  < ${@tag || nativeInputTag}.&__${@elName || 'input'} &
    ref = ${@ref || 'input'} |
    v-model = ${@model || nativeInputModel} |
    :v-attrs = inputAttrs |
    :id = id |
    :type = ${@type || nativeInputType} |
    :name = name |
    :form = form |
    :autofocus = autofocus |
    :tabIndex = tabIndex |
    @focus = onFocus |
    @blur = onBlur |
    ${attrs|!html} |
    ${@attrs}
  .

/**
 * Generates a hidden form input
 */
- block hiddenInput()
  += self.nativeInput({ &
    elName: 'hidden-input',
    attrs: {
      autocomplete: 'off'
    }
  }) .
```
