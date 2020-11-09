# form/b-form

This module provides a component to create a form to group other form components and submit to a data provider.
The component is based on a native `<form>` element and realizes the same behavior as the native API does.

## Synopsis

* The component extends [[iData]].

* The component implements the [[iVisible]] trait.

* The component is used as functional if there is no provided the `dataProvider` prop.

* By default, the root tag of the component is `<form>`.

## Why another component?

* The native form API is based on simple URL-s and HTTP methods, but it's a low-level approach. Opposite, `bForm` uses data providers to submit data.

* `<form>` works with tags; `bForm` works with `iInput/bButton` components.

* To validate data, `iInput` components don't use the native API of form validation, so the simple `<form>` element can't work with it.

* `bForm` provides a bunch of events and modifiers to manage the submit process more efficiently.

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
| `validationStart`   | The validation of associated components has been started                                                   | -                                        | -                                               |
| `validationSuccess` | The validation of associated components has been successfully finished, i.e., all components are valid     | -                                        | -                                               |
| `validationFail`    | The validation of associated components hasn't been successfully finished, i.e, some component isn't valid | Failed validation                        | `ValidationError<this['FormValue']>`            |
| `validationEnd`     | The validation of associated components has been ended                                                     | Validation result \[, Failed validation] | `boolean`, `ValidationError<this['FormValue']>` |
| `submitStart`       | The component started to submit data                                                                       | Data to submit, Submit context           | `SubmitBody`, `SubmitCtx`                       |
| `submitSuccess`     | The submission of the form has been successfully finished                                                  | Operation response, Submit context       | `unknown`, `ValidationError<this['FormValue']>` |
| `submitFail`        | The submission of the form hasn't been successfully finished                                               | Error object, Submit context             | `Error \| RequestError`, `SubmitCtx`            |
| `submitEnd`         | The submission of the form has been ended                                                                  | Operation result, Submit context         | `SubmitResult`, `SubmitCtx`                     |

Also, you can see the [[iVisible]] trait and the [[iData]] component.

## Usage

1. Simple usage.

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

2. Providing an action URL.

```
/// This kind of API is closer to the native.
/// The form data is provided to the common data provider by the specified URL and via the `add` method.
< b-form :action = '/create-user' | :method = 'add'
  < b-input :name = 'fname' | :validators = ['required']
  < b-input :name = 'lname'
  < b-input :name = 'bd' | :type = 'date'
  < b-button :type = 'submit'
```

3. Providing of additional request parameters.

```
< b-form :action = '/create-user' | :method = 'add' | :params = {headers: {'x-foo': 'bla'}}
  < b-input :name = 'fname' | :validators = ['required']
  < b-input :name = 'lname'
  < b-input :name = 'bd' | :type = 'date'
  < b-button :type = 'submit'
```

4. Providing an action function.

```
/// We are delegate the submission of data to another function
< b-form :action = createUser
  < b-input :name = 'fname' | :validators = ['required']
  < b-input :name = 'lname'
  < b-input :name = 'bd' | :type = 'date'
  < b-button :type = 'submit'
```

## Slots

The component supports the default slot to provide associated components.

```
< b-form :dataProvider = 'User'
  < b-input :name = 'fname'
  < b-button :type = 'submit'
```

## API

The component provides a bunch of methods to reset/clear/validate values of associate components: `reset`, `clear`, `validate`.
To submit the data manually, use the `submit` method.
Also, the component provides some getters/methods to access associated components: `elements`, `submits`, `getValues`.

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

### Caching of data to submit

`bForm` can cache values sent on the previous submission and don't send it again if its value wasn't changed.
To enable this behavior, toggle a value of the `cache` prop to `true`.
Also, you can separately disable the caching of each component by using a similar prop.

```
< b-form :dataProvider = 'User' | :method = 'upd' | :cache = true
  < b-input :name = 'fname'
  < b-input :name = 'lname'
  < b-input :name = 'bd' | :cache = false
  < b-button :type = 'submit'
```
