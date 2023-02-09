# build/ts-transformers/i18n-inheritance-chain

This transformer adds a chain of inheritance to all components. This allows each component to use translations that have been declared in parent classes.

## example

```ts
class iBlock {
 protected readonly componentI18nKeysets: string[] = [this.componentName];

 get i18n(): ReturnType<typeof i18n> {
  return i18n(this.componentI18nKeysets);
 }
}

class bButton extends iBlock {}

class bCustomButton extends bButton {}
```

Transforms into

```ts
class iBlock {
 protected readonly componentI18nKeysets: string[] = [this.componentName];

 get i18n(): ReturnType<typeof i18n> {
  return i18n(this.componentI18nKeysets);
 }
}

class bButton extends iBlock {
 protected readonly componentI18nKeysets: string[] = ['b-button', 'i-block'];
}

class bCustomButton extends bButton {
 protected readonly componentI18nKeysets: string[] = ['b-custom-button', 'b-button', 'i-block'];
}
```

This allows you to use `i18n` inside the `bCustomButton` component, which will use translations from the parent components `iBlock` and `bButton` and not duplicate them in the component itself.
