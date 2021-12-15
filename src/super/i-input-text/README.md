# super/i-input-text

This module provides a superclass to create text inputs. The class includes API to create a masked input.

## Synopsis

* The component is not used on its own. It is a superclass.

* The component extends [[iInput]].

* The component implements [[iWidth]] and [[iSize]] traits.

## Modifiers

| Name       | Description                            | Values    | Default |
|------------|----------------------------------------|-----------|---------|
| `empty`    | A component text is empty              | `Boolean` | -       |
| `readonly` | The component is in the read-only mode | `Boolean` | -       |

Also, you can see [[iWidth]] and [[iSize]] traits and the [[iInput]] component.

## Events

| Name         | Description                                  | Payload description | Payload |
|--------------|----------------------------------------------|---------------------|---------|
| `selectText` | The component has selected its input content | -                   | -       |
| `clearText`  | The component has cleared its input content  | -                   | -       |

Also, you can see the [[iInput]] component.

## API

Also, you can see the implemented traits or the parent component.

### Props

#### [textProp]

An initial text value of the input.

```
< my-text-input :text = 'my-input'
```

#### [type = `'text'`]

A UI type of the input.
[See more](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Input#input_types)

```
< my-text-input :type = 'color'
```

#### [autocomplete = `'off'`]

An autocomplete mode of the input.

[See more](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Input#htmlattrdefautocomplete)

#### [placeholder]

A placeholder text of the input

[See more](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Input#htmlattrdefplaceholder)

```
< my-text-input :placeholder = 'Enter you name'
```

#### [minLength]

The minimum text value length of the input.
The option will be ignored if provided `mask`.

[See more](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Input#htmlattrdefminlength)

#### [maxLength]

The maximum text value length of the input.
The option will be ignored if provided `mask`.

[See more](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Input#htmlattrdefmaxlength)

#### [mask]

A value of the input's mask.

The mask is used when you need to "decorate" some input value,
like a phone number or credit card number. The mask can contain terminal and non-terminal symbols.
The terminal symbols will be shown as they are written.
The non-terminal symbols should start with `%` and one more symbol. For instance, `%d` means that it can be
replaced by a numeric character (0-9).

Supported non-terminal symbols:

* `%d` - is equivalent RegExp' `\d`
* `%w` - is equivalent RegExp' `\w`
* `%s` - is equivalent RegExp' `\s`

```
< b-input :mask = '+%d% (%d%d%d) %d%d%d-%d%d-%d%d'
```

#### [maskPlaceholder = `'_'`]

A value of the mask placeholder.
All non-terminal symbols from the mask without the specified value will have this placeholder.

```
/// A user will see an input element with a value:
/// +_ (___) ___-__-__
/// When it starts typing, the value will be automatically changed, like,
/// +7 (49_) ___-__-__
< b-input :mask = '+%d% (%d%d%d) %d%d%d-%d%d-%d%d' | :maskPlaceholder = '_'
```

#### [maskRepetitionsProp]

Number of mask repetitions.
This parameter allows you to specify how many times the mask pattern needs to apply to the input value.
The `true` value means that the pattern can be repeated infinitely.

```
/// A user will see an input element with a value:
/// _-_
/// When it starts typing, the value will be automatically changed, like,
/// 2-3 1-_
< b-input :mask = '%d-%d' | :maskRepetitions = 2
```

#### [maskDelimiter =  = `' '`]

Delimiter for a mask value. This parameter is used when you are using the `maskRepetitions` prop.
Every next chunk of the mask will have the delimiter as a prefix.

```
/// A user will see an input element with a value:
/// _-_
/// When it starts typing, the value will be automatically changed, like,
/// 2-3@1-_
< b-input :mask = '%d-%d' | :maskRepetitions = 2 | :maskDelimiter = '@'
```

#### [regExps]

A dictionary with RegExp-s as values.
Keys of the dictionary are interpreted as non-terminal symbols for the component mask, i.e.,
you can add new non-terminal symbols.

```
< b-input :mask = '%l%l%l' | :regExps = {l: /[a-z]/i}
```

### Fields

#### text

A text value of the input. It can be modified directly from a component.

### Getters

### isMaskInfinite

True if the mask is repeated infinitely.

### Methods

#### selectText

Selects all content of the input.

#### clearText

Clears content of the input.

### Built-in validators

The component provides a bunch of validators.

##### required

Checks that a component value must be filled.

##### pattern

Checks that a component value must be matched to the provided pattern.
