# components/form/b-form

This module provides a component for creating a form to group other form components and submit to a data provider.
The component is based on the native `<form>` element and implements the same behavior as the native API.

## Synopsis

* The component extends [[iData]].

* The component implements the [[iVisible]] trait.

* The component is used as functional if there is no provided the `dataProvider` prop.

* By default, the component's root tag is set to `<form>`.

## Modifiers

| Name    | Description                                          | Values    | Default |
|---------|------------------------------------------------------|-----------|---------|
| `valid` | All associated components have passed the validation | `boolean` | -       |

Also, you can see the [[iVisible]] trait and the [[iData]] component.

## Events

| Name                | Description                                                                                                | Payload description                      | Payload                                         |
|---------------------|------------------------------------------------------------------------------------------------------------|------------------------------------------|-------------------------------------------------|
| `clear`             | All associated components have been cleared via `clear`                                                    | -                                        | -                                               |
| `reset`             | All associated components have been reset via `reset`                                                      | -                                        | -                                               |
| `validationStart`   | Validation of the associated components has been started                                                   | -                                        | -                                               |
| `validationSuccess` | Validation of the associated components has been successfully finished, i.e., all components are valid     | -                                        | -                                               |
| `validationFail`    | Validation of the associated components hasn't been successfully finished, i.e, some component isn't valid | Failed validation                        | `ValidationError<this['FormValue']>`            |
| `validationEnd`     | Validation of the associated components has been ended                                                     | Validation result \[, Failed validation] | `boolean`; `ValidationError<this['FormValue']>` |
| `submitStart`       | The component started to submit data                                                                       | Data to submit; Submit context           | `SubmitBody`; `SubmitCtx`                       |
| `submitSuccess`     | Submission of the form has been successfully finished                                                      | Operation response; Submit context       | `unknown`; `ValidationError<this['FormValue']>` |
| `submitFail`        | Submission of the form hasn't been successfully finished                                                   | Error object; Submit context             | `Error  │ RequestError`; `SubmitCtx`            |
| `submitEnd`         | Submission of the form has been ended                                                                      | Operation result; Submit context         | `SubmitResult`; `SubmitCtx`                     |

Also, you can see the [[iVisible]] trait and the [[iData]] component.

## Why another component?

* The native forms API is based on simple URLs and HTTP methods, but this is a low-level approach.
  In contrast, `bForm` uses data providers to submit data.

* `<form>` works with tags; `bForm` works with `iInput/bButton` components.

* `input` components do not use the native form validation API to validate data, so a simple `<form>` element cannot work with it.

* `bForm` provides a set of events and modifiers to more effectively control the submission process.

## Usage

### Simple usage

```
/// The form data is provided to the `User` data provider via the `add` method
< b-form :dataProvider = 'User' | :method = 'add'
  < b-input :name = 'fname' | :validators = ['required']
  < b-input :name = 'lname'
  < b-input :name = 'bd' | :type = 'date'
  < b-button :type = 'submit'

/// Association of the form and components by id
< b-form :dataProvider = 'User' | :method = 'upd' | :id = 'upd-user-form'
< b-input :name = 'fname' | :form = 'upd-user-form'
< b-button :type = 'submit' | :form = 'upd-user-form'
```

### Providing an action URL

```
/// This kind of API is closer to the native.
/// The form data is provided to the common data provider by the specified URL and using the `add` method.
< b-form :action = '/create-user' | :method = 'add'
  < b-input :name = 'fname' | :validators = ['required']
  < b-input :name = 'lname'
  < b-input :name = 'bd' | :type = 'date'
  < b-button :type = 'submit'
```

### Providing additional request parameters

```
< b-form :action = '/create-user' | :method = 'add' | :params = {headers: {'x-foo': 'bla'}}
  < b-input :name = 'fname' | :validators = ['required']
  < b-input :name = 'lname'
  < b-input :name = 'bd' | :type = 'date'
  < b-button :type = 'submit'
```

### Providing an action function

```
/// We are delegate the submission of data to another function
< b-form :action = createUser
  < b-input :name = 'fname' | :validators = ['required']
  < b-input :name = 'lname'
  < b-input :name = 'bd' | :type = 'date'
  < b-button :type = 'submit'
```

## Slots

The component supports the `default` slot to provide associated components.

```
< b-form :dataProvider = 'User'
  < b-input :name = 'fname'
  < b-button :type = 'submit'
```

## API

Additionally, you can view the implemented traits or the parent component.

### Props

#### [id]

The form identifier.
You can use it to connect the form to components lying "outside" from the form body (using the `form` attribute).

```
< b-form :id = 'bla'

< b-input :form = 'bla'
```

#### [name]

The form name.
You can use it to find the form element via `document.forms`.

```
< b-form :name = 'bla'
```

```js
console.log(document.forms['bla']);
```

#### [action]

The form action URL (the URL where the data will be submitted) or a function to create the action.
If no value is specified, the component will use the default URLs from the data provider.

```
< b-form :action = '/create-user'
< b-form :action = createUser
```

#### [method = `'post'`]

The data provider method that is called when the form is submitted.

```
< b-form :dataProvider = 'User' | :method = 'upd'
```

#### [paramsProp]

Additional form request parameters.

```
< b-form :params = {headers: {'x-foo': 'bla'}}
```

#### [cache = `false`]

If true, form elements are cached.
Caching means that if some component value has not changed since the last time the form was submitted, it will not be resubmitted.

```
< b-form :dataProvider = 'User' | :method = 'upd' | :cache = true
  < b-input :name = 'fname'
  < b-input :name = 'lname'
  < b-input :name = 'bd' | :cache = false
  < b-button :type = 'submit'
```

### Fields

#### params

Additional form request parameters.

### Getters

#### elements

A list of form related components.

#### submits

A list of submit components associated with the form.

### Methods

#### clear

Clears the values of all related components.

#### reset

Resets the values to default for all related components.

#### validate

Validates the values of all related components and returns:

1. `ValidationError` - if the validation fails;
2. A list of components to send - if the validation was successful.

#### submit

Submits the form.

### Validation

`bForm` automatically validates all related components before each submission.

```
< b-form :dataProvider = 'User' | :method = 'add'
  < b-input :name = 'fname' | :validators = ['required', 'name']
  < b-input :name = 'lname'
  < b-input :name = 'bd' | :type = 'date' | :validators = ['required']
  < b-button :type = 'submit'
```

### Data conversion for sending

If the component associated with `bForm` provides the `formConverter` prop, it will be used by `bForm` to convert the group value
of the associated component before submitting.

```
< b-form :dataProvider = 'User' | :method = 'add'
  < b-input :name = 'fname' | :formConverter = getRandomName
  < b-input :name = 'fname'
  < b-button :type = 'submit'
```
