# components/super/i-input

This module provides a superclass for all form components.

## Synopsis

* The component is not used on its own. It is a superclass.

* The component extends [[iData]].

* The component implements [[iVisible]], [[iAccess]] traits.

## Modifiers

| Name        | Description                                                                                                  | Values    | Default |
|-------------|--------------------------------------------------------------------------------------------------------------|-----------|---------|
| `form`      | The system modifier. Used for finding form components in the DOM tree.                                       | `boolean` | `true`  |
| `valid`     | The component has passed data validation                                                                     | `boolean` | -       |
| `showInfo`  | The component shows an informational message (e.g., password creation tips) through output                   | `boolean` | -       |
| `showError` | The component shows an error message (e.g., using invalid characters for password generation) through output | `boolean` | -       |

Also, you can see [[iVisible]] and [[iAccess]] traits and the [[iData]] component.

## Events

| Name                | Description                                                                                      | Payload description                               | Payload                                         |
|---------------------|--------------------------------------------------------------------------------------------------|---------------------------------------------------|-------------------------------------------------|
| `change`            | The component value has been changed                                                             | Component value                                   | `this['Value']`                                 |
| `actionChange`      | The component value has been changed due to some user action                                     | Component value                                   | `this['Value']`                                 |
| `clear`             | The component value has been cleared via `clear`                                                 | Component value                                   | `this['Value']`                                 |
| `reset`             | The component value has been reset via `reset`                                                   | Component value                                   | `this['Value']`                                 |
| `validationStart`   | The component validation has been started                                                        | -                                                 | -                                               |
| `validationSuccess` | The component validation has been successfully finished, i.e., the component value is valid      | -                                                 | -                                               |
| `validationFail`    | The component validation hasn't been successfully finished, i.e, the component value isn't valid | Failed validation                                 | `ValidationError<this['FormValue']>`            |
| `validationEnd`     | The component validation has been ended                                                          | Is the data valid or not?; \[, Failed validation] | `boolean`; `ValidationError<this['FormValue']>` |

Also, you can see [[iVisible]] and [[iAccess]] traits and the [[iData]] component.

## Basic concepts

Every form component, just like native form tags such as input and checkbox,
comes with an API consisting of a similar set of properties and methods.
This class serves as the API provider, meaning that if you want your component to function as a form component,
you should inherit it from this class.

```typescript
import iInput, { component } from 'components/super/i-input/i-input';

@component()
export default class MyInput extends iInput {
  declare protected readonly $refs: iInput['$refs'] & {input: HTMLInputElement};
}
```

## Associated types

The component has two associated types to specify the original value and form value types.

* **Value** represents the original value of the component.
* **FormValue** represents the modified value of the component that will be sent with the associated form.

```typescript
import iInput, { component } from 'components/super/i-input/i-input';

@component()
export default class MyInput extends iInput {
  declare readonly Value: string;

  declare readonly FormValue: Number;

  override readonly dataType: Function = parseInt;

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

## API

Also, you can see [[iVisible]] and [[iAccess]] traits and the [[iData]] component.

### Props

#### [valueProp]

The value of the component.

```
< b-input :name = 'fname' | :value = 'Andrey'
```

#### [defaultProp]

The default value of the component.
This value will be used if no `value` is specified for the property or after calling the `reset` method.

```
< b-input :name = 'fname' | :value = name | :default = 'Anonymous'
```

#### [id]

The ID attribute value for the component.
Typically, this attribute is set on the native form control element inside the component.
You can use it to integrate with a label or other form element.

```
< b-input :id = 'my-input'

< label for = my-input
  The input label
```

#### [name]

A string specifying a name for the form control.
This name is submitted along with the control value when the form data is submitted.
If you do not specify a name, the form will ignore your component.
[See more](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefname).

```
< form
  < b-input :name = 'fname' | :value = 'Andrey'

  /// After pressing, the form generates an object to submit with values {fname: 'Andrey'}
  < button type = submit
    Submit
```

#### [form]

A string specifying the `<form>` element with which the component is associated (that is, its form owner).
This string value, if present, must match the id of a `<form>` element in the same document.
If this attribute isn't specified, the component is associated with the nearest containing form, if any.

The form prop lets you place a component anywhere in the document but have it included with a form elsewhere
in the document.
[See more](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefform).

```
< b-input :name = 'fname' | :form = 'my-form'

< form id = my-form
  < button type = submit
    Submit
```

#### [attrsProp]

Additional attributes that are provided to the native form control within the component.

```
< b-input-hidden :attrs = {type: 'checkbox'}
```

#### [disallow]

Component value(s) that cannot be submitted via the associated form.
If the component value matches with one of the denied conditions,
the component form value will be set to undefined.

The parameter can accept a value or an iterable of values to be prohibited.
You can also pass the parameter as a function or a regular expression.

```
/// Disallow values that contain only whitespaces
< b-input :name = 'name' | :disallow = /^\s*$/
```

#### [formValueConverter]

Component value converter(s) to form value.

You can provide one or more functions to convert the original value into a new form value.
For example, if you have an input component, the original input value is a string, but you provide a function to
parse that string into a Date object.

```
< b-input :formValueConverter = toDate
```

To provide more than one function, pass an iterable of functions.
The functions from the iterable will be called from left to right.

```
< b-input :formValueConverter = [toDate, toUTC]
```

Any converter can return a Promise.
When iterating through value converters, they will wait for the previous value to be resolved before being called.

Additionally, any transformer can return a `Maybe` monad. This helps to combine validators and converters.

```
< b-input :validators = ['required'] | :formValueConverter = [toDate.option(), toUTC.toUTC()]
```

#### [formConverter = `(v) => Object.isArray(v) && v.length < 2 ? v[0] : v`]

Converter(s) that is used by the associated form.
The form applies these converters to the group form value of the component.

To provide more than one function, pass an iterable of functions.
The functions from the iterable will be called from left to right.

```
< b-input :formConverter = [toProtobuf, zip]
```

Any converter can return a Promise.
When iterating through value converters, they will wait for the previous value to be resolved before being called.

Additionally, any transformer can return a `Maybe` monad. This helps to combine validators and converters.

```
< b-input :validators = ['required'] | :formConverter = [toProtobuf.option(), zip.toUTC()]
```

#### [cache]

If set to false, the linked form will not cache the component value.

Caching means that if the component value has not changed since the last form submission,
it will not be resubmitted.

### Loading data from a provider

Because the class extends from [[iData]], all form components can load their own data from providers.
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

All instances of the `iInput` class support a validation feature.
The validation process can be triggered either manually by calling the validate method or implicitly
by using a form associated with the component.

To specify validators for a component, use the `validatorsProp` prop.
This prop takes an iterable of strings representing the validator names.

```
< b-input :validators = ['required', 'validUserName']
```

Also, you have the option to set additional parameters for each validator.

```
< b-input :validators = [ &
  // To provide parameters you can use an array form
  ['required', {msg: 'This is required field!'}],

  // Or an object form
  {validUserName: {showMsg: false}}
] .
```

The supported validators for the `iInput` class are defined in the `validators` static property.
This property is a dictionary where the keys represent the names of the validators, and the values are functions.
These functions accept validation parameters and must return a `ValidatorResult` type.
Any validator can return a promise.

#### Automatic validation

By default, the validation process is automatically triggered on the `actionChange` event.
This event is fired only when a user manually changes the value of the component.

```
/// Every time a user enters a value into the component, the component triggers validation
< b-input :validators = ['required', 'email']
```

#### Built-in validators

The component provides a bunch of built-in validators.

##### required

Checks if a component has been filled out.
If a user tries to submit a form without entering any data in a required field,
the validation will fail and indicate that the field is required.
The user must fill in the required field before the submission can proceed.

```
< b-input :validators = ['required']
```

#### custom

The custom validator allows you to specify a custom validation function that can be used to validate a field in a form.
It provides a way for you to define your own logic for validation.

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

In this example, `yourValidator` refers to the custom validation function that you define yourself.
The `param1` and `param2` are additional parameters that can be passed to the custom validation function
as an object `{param1: 'foo', param2: 'bar'}`.

It is important to note that when using the custom validator, you must provide a function as the validator parameter.
If you specify the validator without a function, an error will be thrown.

```
< b-input :validators = ['custom']
```

You're free to add a new validator to your component.

```typescript
import iInput, { component } from 'components/super/i-input/i-input';

@component()
export default class MyInput extends iInput {
  declare readonly Value: string;

  declare readonly FormValue: Number;

  override readonly dataType: Function = parseInt;

  override static validators: ValidatorsDecl = {
    // Inherit parent validators
    ...iInput.validators,

    async moreThan5({msg, showMsg = true}: ValidatorParams): Promise<ValidatorResult<boolean>> {
      if ((await this.formValue) <= 5) {
        // This method is set a validation message to the component
        this.setValidationMessage(
          // This function returns a validation message based on the validation result, custom parameters, etc.
          this.getValidatorMessage(
            // Validation result: boolean or ValidatorError
            false,

            // The user defined message (if specified).
            // Or an object with messages for each type of errors.
            // Or a function to invoke.
            msg,

            // The default message
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

To display information about warnings and errors using the info and error properties in descendants of
`iInput` component, you can add these properties in your component template.

```
< b-input :info = 'This is required field'
```

You can place these properties anywhere in your component template, OR if you enable `messageHelpers` to true,
the layout will be generated automatically: all you have to do is write the CSS rules.

```
< b-input :info = 'This is required field' | :messageHelpers = true
```

### Fields

#### value

The value of the component.
It can be modified directly from the component.

#### default

The default value of the component.
This value will be used if no `value` is specified for the property or after calling the `reset` method.

### Getters

#### formValue

The form value of the component.
The getter always returns a promise.

According to the design, all `iInput` components have their own "individual" values and "form" values.
The form value is based on the component's individual value, but in simple cases they are equal.
The form associated with this component will use the form value, but not the original one.

When getting the form value, the functions passed to `disallow` are first applied to
the component's individual value.
If any of these functions return true, then the form value will be undefined.
Next, the functions passed to `formValueConverter` will be applied to the obtained value (if allowed) and
the result will be returned.

#### groupFormValue

A list of component form values.
The values are taken from components with the same `name` attribute that are associated with the same form.
The getter always returns a promise.

#### groupElements

A list of components with the same `name` attribute that are associated with the same form.

### Methods

#### clear

Clears the component value to undefined.

#### reset

Resets the component value to default.

#### validate

Validates the component value.
The method returns true if the validation is successful or an object with error information.

### Template methods

#### nativeInput/hiddenInput

The mentioned blocks generate native input tags with predefined attributes.
They can be used to mimic the native behavior of the component.
Additionally, you can control the type of tag created and other options using predefined constants.

```
- nativeInputTag = 'input'
- nativeInputType = "'hidden'"
- nativeInputModel = 'valueStore'

/**
 * Generates a native form input
 *
 * @param [params] - additional parameters:
 *   *) [tag=nativeInputTag] - the name of the generated tag
 *   *) [elName='input'] - the element name of the generated tag
 *
 *   *) [ref='input'] - the `ref` attribute
 *   *) [model=nativeInputModel] - the `v-model` attribute
 *
 *   *) [id='id'] - the `:id` attribute
 *   *) [name='name'] - the `:name` attribute
 *   *) [form='form'] - the `:form` attribute
 *   *) [type=nativeInputType] - the `:type` attribute
 *
 *   *) [autofocus] - the `:autofocus` attribute
 *   *) [tabIndex] - the `:autofocus` attribute
 *
 *   *) [focusHandler] - the `@focus` attribute
 *   *) [blurHandler] - the `@blur` attribute
 *
 *   *) [attrs] - a dictionary with additional attributes
 *
 * @param {string} [content] - the slot content
 */
- block nativeInput(@params = {}, content = '')
  {{ void(tmp.attrs = normalizeAttrs(attrs)) }}

  < ${@tag || nativeInputTag}.&__${@elName || 'input'} &
    ref = ${@ref || 'input'} |
    v-model = ${@model || nativeInputModel} |

    :id = ${@id || 'id'} |
    :name = ${@name || 'name'} |
    :form = ${@form || 'form'} |
    :type = ${@type} || tmp.attrs.type || ${nativeInputType} |

    :autofocus = ${@autofocus || 'autofocus'} |
    :tabindex = ${@tabIndex || 'tabIndex'} |

    @focus = ${@focusHandler || 'onFocus'} |
    @blur = ${@blurHandler || 'onBlur'} |

    v-attrs = tmp.attrs |
    ${Object.assign({}, attrs, @attrs)|!html}
  .
    += content

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
