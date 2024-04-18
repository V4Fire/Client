# base/b-bottom-slide

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

The component supports two kinds of height modes to calculate.

* `full` – the height value is equal to the viewport height.
* `content` – the height value is based on the component content, but no more than the viewport height.

You can select the height mode calculation by providing the `heightMode` prop.

```
< b-bottom-slide :heightMode = 'full'
```

### Steps

When opened, the component can have several steps stop. That is, the component can be opened halfway and only after this step to its full size.
To do this, provide the `steps` prop.

```
< b-bottom-slide :steps = [50]
```

In this example, when the component is opened, it first opens at 50% of its own size,
and only after user action or calling special methods, the component is opened or closed completely.

### Lazy rendering

It is a good practice not to render or load what a user cannot see on the screen.
The component supports the ability not to render content until it is open.
This can be done using the `forceInnerRender` prop.
You need to set `forceInnerRender` to` false` to avoid immediately rendering the component's content.

```
< b-bottom-slide :forceInnerRender = false
  < .&__large-inner-content-with-many-components
```

### Singleton

It is also a good practice to use a component as [singleton](https://en.wikipedia.org/wiki/Singleton_pattern).
This approach implementation remains entirely on clients of this component, but we will consider few options.

First, let's create a wrapper component that will contain `b-bottom-slide` and provide methods to open and close `b-bottom-slide`.

__b-modal.ts__

```typescript
@component()
export default class bModal extends iBlock {
  /** @override */
  protected $refs!: {
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

- include 'super/i-block'|b as placeholder

- template index() extends ['i-block'].index
  - block body
    < b-bottom-slide ref = bottomSlide
```

After that, let's add our new `b-modal` component to the root component so clients can refer to its methods.

__p-root.ts__

```typescript
@component({root: true})
export default class pV4ComponentsDemo extends iStaticPage {
  /** @override */
  protected $refs!: {
    modal: bModal;
  };

  get modal(): bModal {
    return this.$refs.modal;
  }
}
```

__p-root.ss__

```
- include 'super/i-static-page/i-static-page.component.ss'|b as placeholder

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

Okay, now we can access `b-bottom-slide` from anywhere, but what's the point in the `b-modal` component?
The point is simple. It will implement the logic of a wrapper component that will render templates inside `b-bottom-slide`.

Many approaches can be used here.
For example, the `open` method of the `b-modal `component can take an object on which to draw the content in `b-bottom-slide`.

__b-modal.ts__

```typescript
@component()
export default class bModal extends iBlock {
  @field()
  title?: string;

  @field()
  text?: string;

  /** @override */
  protected $refs!: {
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

- include 'super/i-block'|b as placeholder

- template index() extends ['i-block'].index
  - block body
    < b-bottom-slide ref = bottomSlide
      < .&__title v-if = title
        {{ title }}

      < .&__text v-if = text
        {{ text }}
```

Alternatively, you can use a string name to render the specific template.

These are just two of the many approaches that the `V4Fire` framework gives you to use that kind of component.
There are many more options you can think of to cover your needs.

## Slots

The component supports the default slot to provide a content.

```
< b-bottom-slide
  < img src = https://fakeimg.pl/300x300
```

## API

Also, you can see the parent component and the component traits.

### Props

#### [heightMode = `'full'`]

The component height mode:

1. `content` – the height value is based on a component content, but no more than the viewport height;
2. `full` – the height value is equal to the viewport height.

#### [stepsProp = `[]`]

A list of allowed component positions relative to the screen height (in percentages).

#### [visible = `0`]

The minimum height value of a visible part (in pixels), i.e., even the component is closed, this part still be visible.

#### [maxVisiblePercent = `90`]

The maximum height value to which you can pull the component.

#### [fastSwipeDelay = `300`]

The maximum time in milliseconds after which we can assume that there was a quick swipe.

#### [fastSwipeThreshold = `10`]

The minimum required amount of pixels of scrolling after which we can assume that there was a quick swipe.

#### [swipeThreshold = `40`]

The minimum required amount of pixels of scrolling to swipe.

#### [overlay = `true`]

If true, the component will overlay background while it's opened.

#### [maxOpacity = `0.8`]

The maximum value of overlay opacity.

#### [scrollToTopOnClose = `true`]

If true, then the content scroll will be automatically reset to the top after closing the component.

#### [forceInnerRender = `true`]

If false, the inner content of the component won't be rendered if the component isn't opened.

### Getters

#### isFullyOpened

True if the content is fully opened.

#### isClosed

True if the content is fully closed.

#### steps

A list of possible component positions relative to the screen height (in percentages).

### Methods

#### next

Switches to the next component step.
The method returns false if the component is already fully opened.

#### prev

Switches to the previous component step.
The method returns false if the component is already closed.
