# form/b-form

This module provides a component to create a form to group other form components and submit to a data provider.
The component is based on a native `<form>` element and realizes the same behavior as the native API does.

## Synopsis

* The component extends [[iData]].

* The component implements the [[iVisible]] trait.

* The component is used as functional if there is no provided the `dataProvider` prop.

* By default, the root tag of the component is `<form>`.

## Modifiers

| Name    | Description                                          | Values    | Default |
| ------- | ---------------------------------------------------- | ----------| ------- |
| `valid` | All associated components have passed the validation | `Boolean` | -       |

Also, you can see the [[iVisible]] trait and the [[iData]] component.

## Events

| Name                | Description                                                                                                | Payload description                      | Payload                                         |
| ------------------- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ----------------------------------------------- |
| `clear`             | All associated components have been cleared via `clear`                                                    | -                                        | -                                               |
| `reset`             | All associated components have been reset via `reset`                                                      | -                                        | -                                               |
| `validationStart`   | Validation of the associated components has been started                                                   | -                                        | -                                               |
| `validationSuccess` | Validation of the associated components has been successfully finished, i.e., all components are valid     | -                                        | -                                               |
| `validationFail`    | Validation of the associated components hasn't been successfully finished, i.e, some component isn't valid | Failed validation                        | `ValidationError<this['FormValue']>`            |
| `validationEnd`     | Validation of the associated components has been ended                                                     | Validation result \[, Failed validation] | `boolean`, `ValidationError<this['FormValue']>` |
| `submitStart`       | The component started to submit data                                                                       | Data to submit, Submit context           | `SubmitBody`, `SubmitCtx`                       |
| `submitSuccess`     | Submission of the form has been successfully finished                                                      | Operation response, Submit context       | `unknown`, `ValidationError<this['FormValue']>` |
| `submitFail`        | Submission of the form hasn't been successfully finished                                                   | Error object, Submit context             | `Error \| RequestError`, `SubmitCtx`            |
| `submitEnd`         | Submission of the form has been ended                                                                      | Operation result, Submit context         | `SubmitResult`, `SubmitCtx`                     |

Also, you can see the [[iVisible]] trait and the [[iData]] component.

## Why another component?

* The native form API is based on simple URL-s and HTTP methods, but it's a low-level approach.
  Opposite, `bForm` uses data providers to submit data.

* `<form>` works with tags; `bForm` works with `iInput/bButton` components.

* To validate data, `iInput` components don't use the native API of form validation, so the simple `<form>` element can't work with it.

* `bForm` provides a bunch of events and modifiers to manage the submit process more efficiently.

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
/// The form data is provided to the common data provider by the specified URL and via the `add` method.
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

Also, you can see the implemented traits or the parent component.

### Props

#### [id]

A form identifier.
You can use it to connect the form with components that lay "outside"
from the form body (by using the `form` attribute).

```
< b-form :id = 'bla'

< b-input :form = 'bla'
```

#### [name]

A form name.
You can use it to find the form element via `document.forms`.

```
< b-form :name = 'bla'
```

```js
console.log(document.forms['bla']);
```

#### [action]

A form action URL (the URL where the data will be sent) or a function to create action.
If the value is not specified, the component will use the default URL-s from the data provider.

```
< b-form :action = '/create-user'
< b-form :action = createUser
```

#### [method = `'post'`]

A data provider method which is invoked on the form submit.

```
< b-form :dataProvider = 'User' | :method = 'upd'
```

#### [paramsProp]

Additional form request parameters.

```
< b-form :params = {headers: {'x-foo': 'bla'}}
```

#### [cache = `false`]

If true, then form elements is cached.
The caching is mean that if some component value doesn't change since the last sending of the form, it won't be sent again.

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

A list of components that are associated with the form.

#### submits

A list of components to submit that are associated with the form.

### Methods

#### clear

Clears values of all associated components.

#### reset

Resets values to defaults of all associated components.

#### validate

Validates values of all associated components and returns:

1. `ValidationError` - if the validation is failed;
2. List of components to send - if the validation is successful.

#### submit

Submits the form.

### Validation

`bForm` automatically validates all associated components before each submission.

```
< b-form :dataProvider = 'User' | :method = 'add'
  < b-input :name = 'fname' | :validators = ['required', 'name']
  < b-input :name = 'lname'
  < b-input :name = 'bd' | :type = 'date' | :validators = ['required']
  < b-button :type = 'submit'
```

### Converting of data to submit

If a component associated with `bForm` provides the `formConverter` prop, it will be used by `bForm` to transform the
associated component's group value before submission.

```
< b-form :dataProvider = 'User' | :method = 'add'
  < b-input :name = 'fname' | :formConverter = getRandomName
  < b-input :name = 'fname'
  < b-button :type = 'submit'
```
