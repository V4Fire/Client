# form/b-form

This module provides a component to create a form to group other form components and submit to a data provider.

## Synopsis

* The component extends [[iData]].

* The component implements the [[iVisible]] trait.

* The component is used as functional if there is no provided the `dataProvider` prop.

* By default, the root tag of the component is `<form>`.

## Modifiers

| Name        | Description                                          | Values    | Default |
| ----------- | ---------------------------------------------------- | ----------| ------- |
| `valid`     | All associated components have passed the validation | `Boolean` | -       |

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
