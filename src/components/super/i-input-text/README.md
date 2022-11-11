# components/super/i-input-text

This module provides a superclass to create text inputs. The class includes an API for creating masked input.

## Synopsis

* The component is not used on its own. It is a superclass.

* The component extends [[iInput]].

* The component implements [[iWidth]] and [[iSize]] traits.

## Modifiers

| Name       | Description                        | Values    | Default |
|------------|------------------------------------|-----------|---------|
| `empty`    | Tee component text is empty        | `boolean` | -       |
| `readonly` | The component is in read-only mode | `boolean` | -       |

Also, you can see [[iWidth]] and [[iSize]] traits and the [[iInput]] component.

## Events

| Name         | Description                          | Payload description | Payload |
|--------------|--------------------------------------|---------------------|---------|
| `selectText` | The component has selected its input | -                   | -       |
| `clearText`  | The component has cleared its input  | -                   | -       |

Also, you can see the [[iInput]] component.

## How to enable input mask support?

By default, the component does not load the module for working with input masks.
To enable support you need to add the following import to your project.

```typescript
import Mask, * as MaskAPI from 'components/super/i-input-text/mask';
Mask.addToPrototype(MaskAPI);
```

## API

Also, you can see the implemented traits or the parent component.

### Props

#### [textProp]

The input text value.

```
< my-text-input :text = 'my-input'
```

#### [type = `'text'`]

The input UI type.
[See more](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Input#input_types).

```
< my-text-input :type = 'color'
```

#### [autocomplete = `'off'`]

The input autocomplete mode.
[See more](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Input#htmlattrdefautocomplete).

#### [placeholder]

The input placeholder.
[See more](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Input#htmlattrdefplaceholder).

```
< my-text-input :placeholder = 'Enter you name'
```

#### [minLength]

The minimum length of the input text value.
The option will be ignored if the `mask` is specified.
[See more](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Input#htmlattrdefminlength).

#### [maxLength]

The maximum length of the input text value.
The option will be ignored if the `mask` is specified.
[See more](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Input#htmlattrdefmaxlength).

#### [mask]

The input text value mask.

The mask is used when you need to "decorate" some input value, such as a phone number or a credit card number.
The mask may contain terminal and non-terminal symbols. The terminal symbols will be displayed as they are written.
The non-terminal symbols must start with `%` and one more character. For instance, `%d` means that it can be
replaced by a numeric character (0-9).

Supported non-terminal symbols:

* `%d` - is equivalent RegExp `\d`
* `%w` - is equivalent RegExp `\w`
* `%s` - is equivalent RegExp `\s`

```
< b-input :mask = '+%d% (%d%d%d) %d%d%d-%d%d-%d%d'
```

#### [maskPlaceholder = `'_'`]

The mask placeholder value.
All non-terminal symbols from the mask without a specified value will have this placeholder.

```
/// The user will see an input element with the value:
/// +_ (___) ___-__-__
/// When it starts typing, the value will be automatically changed, for example,
/// +7 (49_) ___-__-__
< b-input :mask = '+%d% (%d%d%d) %d%d%d-%d%d-%d%d' | :maskPlaceholder = '_'
```

#### [maskRepetitionsProp]

The number of repetitions of the mask.
This option allows you to specify how many times the mask pattern should be applied to the input value.
The `true` value means that the pattern can  repeat indefinitely.

```
/// The user will see an input element with the value:
/// _-_
/// When it starts typing, the value will be automatically changed, for example,
/// 2-3 1-_
< b-input :mask = '%d-%d' | :maskRepetitions = 2
```

#### [maskDelimiter =  = `' '`]

The delimiter for the mask value. This parameter is used when you use the `maskRepetitions` property.
Each subsequent mask fragment will have this delimiter as a prefix.

```
/// The user will see an input element with the value:
/// _-_
/// When it starts typing, the value will be automatically changed, for example,
/// 2-3@1-_
< b-input :mask = '%d-%d' | :maskRepetitions = 2 | :maskDelimiter = '@'
```

#### [regExps]

A dictionary with RegExp-s as values.
The dictionary keys are interpreted as non-terminal symbols for the component mask, i.e.
you can add new non-terminal symbols.

```
< b-input :mask = '%l%l%l' | :regExps = {l: /[a-z]/i}
```

### Fields

#### text

The input text value.
It can be modified directly from the component.

### Getters

### isMaskInfinite

True if the mask repeats indefinitely.

### Methods

#### selectText

Selects the entire content of the input.

#### clearText

Clears the content of the input.

### Built-in validators

The component provides a bunch of built-in validators.

##### required

Checks that the component value must be filled.

##### pattern

Checks that the component value must match the provided template.
