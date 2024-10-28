# components/base/b-bottom-slide

This module provides a component to create bottom sheet behavior that is similar to native mobile UI.

## Synopsis

* The component extends [[iBlock]].

* The component implements [[iLockPageScroll]], [[iOpen]], [[iVisible]], [[iHistory]] traits.

## Modifiers

| Name         | Description                                    | Values    | Default |
|--------------|------------------------------------------------|-----------|---------|
| `stick`      | The component sticks to the current position   | `boolean` | `true`  |
| `events`     | The component is ready to process input events | `boolean` | `false` |
| `heightMode` | The component height calculation mode          | `string`  | –       |

Also, you can see the parent component and the component traits.

## Events

| EventName         | Description                                | Payload description          | Payload   |
|-------------------|--------------------------------------------|------------------------------|-----------|
| `open`            | The component has been opened              | –                            | –         |
| `close`           | The component has been closed              | –                            | –         |
| `stepChange`      | The component opened step has been changed | A number of the current step | `number`  |
| `moveStateChange` | The component starts or stops moving       | A state of moving            | `boolean` |

Also, you can see the parent component and the component traits.

## Usage

To start using the component, pass content within the `default` slot.

```
< b-bottom-slide ref = bottomSlide
  < .&__content
    Hello there
```

Now you can open your component by using the `open` method.

```typescript
@component()
class bMyPage extends iData {
  openBottomSlide() {
    this.$refs.bottomSlide.open();
  }
}
```

### Height mode

The component supports two modes for calculating height:

* `full` – the height value is equal to the viewport height.
* `content` – the height value is based on the component's content, but no more than the viewport height.

You can select the height mode calculation by providing the `heightMode` prop.

```
< b-bottom-slide :heightMode = 'full'
```

### Steps

The component can have multiple stopping points when opened. This means the component can be partially opened first and
then expanded to its full size upon user action or calling specific methods. To achieve this, provide the `steps` prop.

```
< b-bottom-slide :steps = [50]
```

In this example, when the component is opened, it first expands to 50% of its full size. Upon further user action or calling special methods,
the component can be fully opened or closed.

### Lazy rendering

A good practice is to avoid rendering or loading content that is not visible to the user. The component supports this feature by providing
the option to delay rendering of the content until the component is opened. To enable this functionality, use the `forceInnerRender` prop and
set it to `false`. By doing so, the component's content will not be rendered immediately.

```
< b-bottom-slide :forceInnerRender = false
  < .&__large-inner-content-with-many-components
```
### Singleton

It's a good practice to use this component as a [singleton](https://en.wikipedia.org/wiki/Singleton_pattern).
Although the implementation of this approach depends on the users of this component, we'll discuss a few options on how to achieve this.

First, let's create a wrapper component that will contain `b-bottom-slide` and provide methods to open and close `b-bottom-slide`.

__b-modal.ts__

```typescript
@component()
export default class bModal extends iBlock {
  declare protected readonly $refs: iBlock['$refs'] & {
    bottomSlide: bBottomSlide;
  };

  @wait('ready')
  open(): Promise<void> {
    return this.$refs.bottomSlide.open();
  }

  @wait('ready')
  close(): Promise<void> {
    return this.$refs.bottomSlide.close();
  }
}
```

Let's add the `b-bottom-slide` component to the component template.

__b-modal.ss__

```
- namespace [%fileName%]

- include 'components/super/i-block'|b as placeholder

- template index() extends ['i-block'].index
  - block body
    < b-bottom-slide ref = bottomSlide
```

After that, let's add our new `b-modal` component to the root component so clients can refer to its methods.

__p-root.ts__

```typescript
@component({root: true})
export default class pV4ComponentsDemo extends iStaticPage {
  declare protected readonly $refs: iStaticPage['$refs'] & {
    modal: bModal;
  };

  get modal(): bModal {
    return this.$refs.modal;
  }
}
```

__p-root.ss__

```
- include 'components/super/i-static-page/i-static-page.component.ss'|b as placeholder

- template index() extends ['i-static-page.component'].index

  - block helpers
    < b-modal ref = modal
```

Now we can call `b-bottom-slide` using the `b-modal` component through the root component from any of our components.

__b-some-component.ts__

```typescript
@component()
export default class bSomeComponent extends iBlock {
  openModal() {
    this.r.modal.open();
  }
}
```

Alright, now we can access `b-bottom-slide` from anywhere. But, what is the purpose of the `b-modal` component?
The purpose is fairly straightforward. The `b-modal` component will implement the logic of a wrapper component that renders
templates inside `b-bottom-slide`.

There are various approaches that can be used to achieve this. For instance, the `open` method of the `b-modal` component
can accept an object that defines the content to be displayed within the `b-bottom-slide`.

__b-modal.ts__

```typescript
@component()
export default class bModal extends iBlock {
  @field()
  title?: string;

  @field()
  text?: string;

  declare protected readonly $refs: iBlock['$refs'] & {
    bottomSlide: HTMLElement;
  };

  @wait('ready')
  open({title, text}: ModalTemplate): Promise<void> {
    this.title = title;
    this.text = text;

    return this.$refs.bottomSlide.open();
  }

  @wait('ready')
  close(): Promise<void> {
    return this.$refs.bottomSlide.close();
  }
}
```

__b-modal.ss__

```
- namespace [%fileName%]

- include 'components/super/i-block'|b as placeholder

- template index() extends ['i-block'].index
  - block body
    < b-bottom-slide ref = bottomSlide
      < .&__title v-if = title
        {{ title }}

      < .&__text v-if = text
        {{ text }}
```

Alternatively, you can use a string name to render a specific template.

## Slots

The component supports the `default` slot - use this slot to provide a content.

```
< b-bottom-slide
  < img src = https://fakeimg.pl/300x300
```

## API

Also, you can see the parent component and the component traits.

### Props

#### [heightMode = `'full'`]

Component height mode:

* `content` - the height value is based on the component content, but no larger than the viewport height;
* `full` - the height value is equal to the height of the viewport.

#### [stepsProp = `[]`]

A list of allowed component positions relative to screen height (percentage).

```
< b-bottom-slide :steps = [50, 75]
```

#### [visible = `0`]

The minimum value of the height of the visible part (in pixels), i.e., even if the component is closed, this part will still be visible.

#### [maxVisiblePercent = `90`]

The maximum height the component can be pulled to.

#### [fastSwipeDelay = `300`]

The maximum time in milliseconds after which it can be considered that there was a fast swipe.

#### [fastSwipeThreshold = `10`]

The minimum required number of scroll pixels, after which it can be considered that there was a fast swipe.

#### [swipeThreshold = `40`]

The minimum number of scroll pixels required for a swipe.

#### [overlay = `true`]

If set to true, the component will overlay the background while it is open.

#### [maxOpacity = `0.8`]

Maximum overlay opacity.

#### [scrollToTopOnClose = `true`]

If set to true, content scrolling automatically resets to the top after the component closes.

#### [forceInnerRender = `true`]

If set to false, the inner content of the component won't be rendered until the component is opened.

### Getters

#### isFullyOpened

True if the content is fully opened.

#### isClosed

True if the content is completely closed.

#### steps

A list of possible component positions relative to screen height (percentage).

### Methods

#### next

Switches to the next component step.
The method returns false if the component is already fully opened.

#### prev

Switches to the previous component step.
The method returns false if the component is already closed.
