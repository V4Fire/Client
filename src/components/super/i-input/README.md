# components/super/i-input

This module provides a superclass for all form components.

## Synopsis

* The component is not used on its own. It is a superclass.

* The component extends [[iData]].

* The component implements [[iVisible]], [[iAccess]] traits.

## Modifiers

| Name        | Description                                                                                                            | Values    | Default |
|-------------|------------------------------------------------------------------------------------------------------------------------|-----------|---------|
| `form`      | The system modifier. Is used to find form components from the DOM tree.                                                | `boolean` | `true`  |
| `valid`     | The component has passed data validation                                                                               | `boolean` | -       |
| `showInfo`  | The component is showing some info message (like advices to generate a password) through output                        | `boolean` | -       |
| `showError` | The component is showing some error message (like using of non-valid characters to generate a password) through output | `boolean` | -       |

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

Like native form tags (input, checkbox, etc.), every form component has an API with a similar set of properties and methods.
This class provides that API, i.e. if you want your component to work as a form component, you should inherit it from this.

```typescript
import iInput, { component } from 'components/super/i-input/i-input';

@component()
export default class MyInput extends iInput {
  protected override readonly $refs!: {input: HTMLInputElement};
}
```

## Associated types

The component has two associated types to specify the original value and form value types.

* **Value** is the original component value.
* **FormValue** is the modified component value that will be sent with by the associated form.

```typescript
import iInput, { component } from 'components/super/i-input/i-input';

@component()
export default class MyInput extends iInput {
  override readonly Value!: string;

  override readonly FormValue!: Number;

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

The component value.

```
< b-input :name = 'fname' | :value = 'Andrey'
```

#### [defaultProp]

The component default value.
This value will be used if no prop value is specified or after a call to the `reset` method.

```
< b-input :name = 'fname' | :value = name | :default = 'Anonymous'
```

#### [id]

The value of the ID attribute for the component.
As a rule, this attribute is set to a native form control inside a component.
Thus, you can use it to integrate with a label or other form element.

```
< b-input :id = 'my-input'

< label for = my-input
  The input label
```

#### [name]

A string specifying a name for the form control.
This name is submitted along with the control value when the form data is submitted.
If you don't provide the name, your component will be ignored by the form.
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
If the component value matches with one of the denied conditions, the component form value will be set to undefined.

The parameter can take a value or an iterable of values to disallow.
You can also pass the parameter as a function or a regular expression.

```
/// Disallow values that contain only whitespaces
< b-input :name = 'name' | :disallow = /^\s*$/
```

#### [formValueConverter]

Component value converter(s) to form value.

You can provide one or more functions to convert the original value into a new form value.
For instance, you have an input component. The original input value is a string, but you provide a function to
parse that string into a Date object.

```
< b-input :formValueConverter = toDate
```

To provide more than one function, pass an iterable of functions. Functions from the iterable are called from left
to right.

```
< b-input :formValueConverter = [toDate, toUTC]
```

Any converter can return a promise. In the case of an iterable of converters, they will wait for the previous call
to resolve. Also, any transformer can return the `Maybe` monad. It helps to combine validators and converters.

```
< b-input :formValueConverter = [toDate.option(), toUTC.option()]
```

#### [formConverter = `(v) => Object.isArray(v) && v.length < 2 ? v[0] : v`]

Converter(s) that is used by the associated form.
The form applies these converters to the group form value of the component.

To provide more than one function, pass an iterable of functions. Functions from the iterable are called from left
to right.

```
< b-input :formConverter = [toProtobuf, zip]
```

Any converter can return a promise. In the case of a list of converters,
they are waiting to resolve the previous invoking.

Any converter can return a promise. In the case of an iterable of converters, they will wait for the previous call
to resolve. Also, any transformer can return the `Maybe` monad. It helps to combine validators and converters.

```
< b-input :validators = ['required'] | :formConverter = [toProtobuf.option(), zip.option()]
```

#### [cache]

If false, then the component value won't be cached by the associated form.
Caching means that if the component value hasn't changed since the last time the form was submitted,
it won't be resubmitted.

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

All instances of the `iInput` class support a feature of validation.
The validation process can be triggered manually by calling the `validate` method, or implicitly by using a form associated
with the component.

To specify validators to a component, use the `validatorsProp` prop. The prop takes an iterable of strings (validator names).

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

Supported validators are placed in the `validators` static property.
This property is a dictionary: the keys represent the names of the validators, and the values are functions that accept
validation parameters and must return a `ValidatorResult` type. Any validator can return a promise.

The `iInput` class provides only one validator out of the box: `required`, which checks that the component must be filled.
You can add a new validator to your component.

```typescript
import iInput, { component } from 'components/super/i-input/i-input';

@component()
export default class MyInput extends iInput {
  override readonly Value!: string;

  override readonly FormValue!: Number;

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

#### Automatic validation

By default, the validation process is automatically started on the `actionChange` event.
This event fires only when the user manually changes the component value.

```
/// Every time the user enters some value into the component, the component calls validation.
< b-input :validators = ['required', 'email']
```

### info/error messages

Descendants of `iInput` can use the `infoProp`/`info` and `errorProp`/`error` properties to display information about warnings and errors.

```
< b-input :info = 'This is required field'
```

You can put these properties somewhere in your component template, OR if you enable `messageHelpers` to `true`,
the layout will be generated automatically: all you have to do is write the CSS rules.

```
< b-input :info = 'This is required field' | :messageHelpers = true
```

### Fields

#### value

The original component value. It can be modified directly from the component.

#### default

The component default value.
This value will be used after invoking of the `reset` method.

### Getters

#### formValue

The component form value.
The getter always returns a promise.

By design, all `iInput` components have their "own" values and "form" values.
The form value is based on the own component value, but in the simple case they are equal.
The form associated with this component will use the value of the form, but not the original.

When getting a form value, the functions passed to `disallow` are first applied to a component own value.
If either of these functions returns true, then the form value will be undefined.
Further, the functions passed to `formValueConverter` will be applied to the received value (if it is allowed) and
the result will be returned.

#### groupFormValue

A list of form values. The values are taken from components with the same `name` attribute that are associated
with the same form. The getter always returns a promise.

#### groupElements

A list of components with the same `name` prop and associated with the same form.

### Methods

#### clear

Clears the component value to undefined.

#### reset

Resets the component value to default.

#### validate

Validates the component value.
The method returns true if the validation is successful or an object with the error information.

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
