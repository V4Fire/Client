# super/i-input

This module provides a superclass for all form components.

## Synopsis

* The component is not used on its own. It is a superclass.

* The component extends [[iData]].

* The component implements [[iVisible]], [[iAccess]] traits.

## Modifiers

| Name        | Description                                                                                                            | Values    | Default |
|-------------|------------------------------------------------------------------------------------------------------------------------|-----------|---------|
| `form`      | The system modifier. Is used to find form components from DOM.                                                         | `boolean` | `true`  |
| `valid`     | The component has passed data validation                                                                               | `boolean` | -       |
| `showInfo`  | The component is showing some info message (like advices to generate a password) through output                        | `boolean` | -       |
| `showError` | The component is showing some error message (like using of non-valid characters to generate a password) through output | `boolean` | -       |

Also, you can see [[iVisible]] and [[iAccess]] traits and the [[iData]] component.

## Events

| Name                | Description                                                                                | Payload description                      | Payload                                         |
|---------------------|--------------------------------------------------------------------------------------------|------------------------------------------|-------------------------------------------------|
| `change`            | A value of the component has been changed                                                  | Component value                          | `this['Value']`                                 |
| `actionChange`      | A value of the component has been changed due to some user action                          | Component value                          | `this['Value']`                                 |
| `clear`             | A value of the component has been cleared via `clear`                                      | Component value                          | `this['Value']`                                 |
| `reset`             | A value of the component has been reset via `reset`                                        | Component value                          | `this['Value']`                                 |
| `validationStart`   | The component validation has been started                                                  | -                                        | -                                               |
| `validationSuccess` | The component validation has been successfully finished, i.e., the component is valid      | -                                        | -                                               |
| `validationFail`    | The component validation hasn't been successfully finished, i.e, the component isn't valid | Failed validation                        | `ValidationError<this['FormValue']>`            |
| `validationEnd`     | The component validation has been ended                                                    | Validation result \[, Failed validation] | `boolean`, `ValidationError<this['FormValue']>` |

Also, you can see [[iVisible]] and [[iAccess]] traits and the [[iData]] component.

## Basic concepts

Like, an `input` or `checkbox`, every form components have the core with a similar set of properties and methods:
form attributes, validators, etc. This class provides this core, i.e., if you want your component to work as a form component,
you should inherit it from this.

```typescript
import iInput, { component } from 'super/i-input/i-input';

export * from 'super/i-input/i-input';

@component()
export default class MyInput extends iInput {
  /** @override */
  protected readonly $refs!: {input: HTMLInputElement};
}
```

## Associated types

The component has two associated types to specify types of an original value and form value.

* **Value** is the original component value.
* **FormValue** is the modified component value that will be sent from a form.

```typescript
import iInput, { component } from 'super/i-input/i-input';

export * from 'super/i-input/i-input';

@component()
export default class MyInput extends iInput {
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

#### [id]

An identifier of the form control.
You free to use this prop to connect the component with a label tag or other stuff.

```
< b-input :id = 'my-input'

< label for = my-input
  The input label
```

#### [name]

A string specifying a name for the form control.
This name is submitted along with the control's value when the form data is submitted.
If you don't provide the name, your component will be ignored by the form.
[See more](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefname).

```
< form
  < b-input :name = 'fname' | :value = 'Andrey'

  /// After pressing, the form generates an object to submit with values {fname: 'Andrey'}
  < button type = submit
    Submit
```

#### [valueProp]

A initial component value.

```
< b-input :name = 'fname' | :value = 'Andrey'
```

#### [defaultProp]

An initial component default value.
This value will be used if the value prop is not specified or after invoking of `reset`.

```
< b-input :name = 'fname' | :value = name | :default = 'Anonymous'
```

#### [form]

A string specifying the `<form>` element with which the component is associated (that is, its form owner).
This string's value, if present, must match the id of a `<form>` element in the same document.
If this attribute isn't specified, the component is associated with the nearest containing form, if any.

The form prop lets you place a component anywhere in the document but have it included with a form elsewhere in the document.
[See more](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefform).

```
< b-input :name = 'fname' | :form = 'my-form'

< form id = my-form
  < button type = submit
    Submit
```

#### [attrsProp]

Additional attributes are provided to the "internal" (native) input tag.

```
< b-input-hidden :attrs = {type: 'checkbox'}
```

#### [cache]

A boolean value that enables or disables caching of a component value by the associated form.
The caching is mean that if the component value does not change since the last sending of the form, it won't be sent again.

#### [disallow]

Component values that are not allowed to send via a form.
If a component value matches with one of the denied conditions, the form value will be equal to `undefined`.

The parameter can take a value or list of values to ban.
Also, the parameter can be passed as a function or regular expression.

```
/// Disallow values that contain only whitespaces
< b-input :name = 'name' | :disallow = /^\s*$/
```

#### [formValueConverter]

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

#### [formConverter = `(v) => Object.isArray(v) && v.length < 2 ? v[0] : v`]

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

### Loading data from a provider

Because the class extends from [[iData]], all input component can load own data from providers.
By default, if the loaded data is a dictionary, it will be mapped to the component properties.
Otherwise, it will be set as a component value. You can re-define this logic by overriding the `initRemoteData` method.

```typescript
function initRemoteData(): CanUndef<CanPromise<unknown | Dictionary>> {
  if (!this.db) {
    return;
  }

  const
    val = this.convertDBToComponent(this.db);

  if (Object.isDictionary(val)) {
    return Promise.all(this.state.set(val)).then(() => val);
  }

  this.value = val;
  return val;
}
```

### Validation

All instances of the `iInput` class support a feature of validation.
The validation process can be triggered manually via invoking the `validate` method or implicitly by a
form associated with the component.

To specify validators to a component, use the `validators` prop. The prop takes an array of strings (validator names).

```
< b-input :validators = ['required', 'validUserName']
```

Also, you can set additional parameters to each validator.

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

#### Automatic validation

By default, the validation process is automatically started on the `actionChange` event.
This event fires only when a user changes the component value manually.

```
/// Every time a user types some value into the component, the component will invoke validation
< b-input :validators = ['required', 'email']
```

#### Built-in validators

The component provides a bunch of validators.

##### required

Checks whether a component has been filled out. If the user attempts to submit the form without entering any data in a required field,
the validation will fail indicating that the field is required and must be filled in before the submission can proceed.

```
< b-input :validators = ['required']
```

#### custom

This validator is used to specify a custom validation function that can be used to validate a field in a form.
This validator allows you to define your own logic for validation.

```
< b-input :validators = [ &
  {
    custom: {
      validator: yourValidator,
      param1: 'foo',
      param2: 'bar'
    }
  }
] .
```

In this example, `yourValidator` is your custom validation function, and `param1` and `param2` are
additional parameters passed to the function as the following object `{param1: 'foo', param2: 'bar'}`.

It is important to note that if you use the custom validator, you must provide a function as the validator parameter.
If you specify the validator without a function, an error will be thrown:

```
< b-input :validators = ['custom']
```

You're free to add a new validator to your component:

```typescript
import iInput, { component } from 'super/i-input/i-input';

export * from 'super/i-input/i-input';

@component()
export default class MyInput extends iInput {
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

### Fields

#### value

The original component value. It can be modified directly from a component.

#### default

The default value of a component. It can be modified directly from a component.
This value will be used after invoking of `reset`.

### Getters

#### formValue

A form value of the component.

By design, all `iInput` components have their "own" values and "form" values.
The form value is based on the own component value, but they are equal in a simple case.
The form associated with this component will use the form value, but not the original.

This value is tested by parameters from `disallow`. If the value does not match allowing parameters,
it will be skipped (the getter returns undefined). The value that passed the validation is converted
via `formValueConverter` (if it's specified).

The getter always returns a promise.

#### groupFormValue

A list of form values. The values are taken from components with the same `name` prop and
which are associated with the same form.

The getter always returns a promise.

#### groupElements

A list of components with the same `name` prop and associated with the same form.

### Methods

#### clear

Clears a component value to undefined.

#### reset

Resets a component value to default.

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
 *
 *   *) [ref='input'] - value of the `ref` attribute
 *   *) [model=nativeInputModel] - value of the `v-model` attribute
 *
 *   *) [id='id'] - value of the `:id` attribute
 *   *) [name='name'] - value of the `:name` attribute
 *   *) [form='form'] - value of the `:form` attribute
 *   *) [type=nativeInputType] - value of the `:type` attribute
 *
 *   *) [autofocus] - value of the `:autofocus` attribute
 *   *) [tabIndex] - value of the `:autofocus` attribute
 *
 *   *) [focusHandler] - value of the `@focus` attribute
 *   *) [blurHandler] - value of the `@blur` attribute
 *
 *   *) [attrs] - dictionary with additional attributes
 */
- block nativeInput(@params = {})
  {{ void(tmp.attrs = normalizeAttrs(attrs)) }}

  < ${@tag || nativeInputTag}.&__${@elName || 'input'} &
    ref = ${@ref || 'input'} |
    v-model = ${@model || nativeInputModel} |

    :id = ${@id || 'id'} |
    :name = ${@name || 'name'} |
    :form = ${@form || 'form'} |
    :type = ${@type} || tmp.attrs.type || ${nativeInputType} |

    :autofocus = ${@autofocus || 'autofocus'} |
    :tabIndex = ${@tabIndex || 'tabIndex'} |

    @focus = ${@focusHandler || 'onFocus'} |
    @blur = ${@blurHandler || 'onBlur'} |

    :v-attrs = tmp.attrs |
    ${Object.assign({}, attrs, @attrs)|!html}
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
