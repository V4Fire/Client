# base/b-tree

This module provides API to render trees of elements.

## How to use

### Render controls

You can pass the item component name to the `option` property and array with deep objects to the `options` property.

Example:

```
< b-tree &
    :option = 'b-checkbox-functional' |
    :options = [
        {id: 'foo'},
        {id: 'bar', children: [
            {id: 'fooone'},
            {id: 'footwo'},
            {id: 'foothree', children: [
                {id: 'foothreeone'}
            ]},
            {id: 'foosix'}
        ]}
    ]
.
```

### Branch Folding

#### About

Module supports feature to fold branches from `children` array. It is implemented using CSS modifiers and by default,
 elements have no styles. So write some CSS rules for hiding `children` when `node` has `folded_false` modifier value.

Example:

```
&__fold:before
    content "-"
    display block

    text-align center

&__node_folded_true &__fold:before
    content "+"

&__node_folded_true &__children
    display none
```

All elements have modifier `folded=true` by default. Set prop `folded = false` to change it.

#### Customization

You can also customize a folding element.
To do this, pass scoped slot `fold` with custom content and set the `params` field with the `v-attrs` property.

Example:

```
< template #fold = o
    < .&__fold :v-attrs = o.params
        ➕
```


### Render customized elements

Module supports passing item content by the `default` slot.
The module will use this template to render all items from `options` property.

Example:

```
< b-tree :options = [
    {id: 'foo'},
    {id: 'bar', children: [
        {id: 'fooone'},
        {id: 'footwo'},
        {id: 'foothree', children: [
            {id: 'foothreeone'}
        ]},
    ]}
] .
    < template #default
        < .&__customized-element
            Custom content
```

### External render filter

Module renders elements with `asyncRender` of the tree root node with default rendering function.
If you need to set an external filter function for the tree render, pass it to the `renderFilter` property.
Also, you can set a separate filter function for nested items. To do this, pass a function to `nestedRenderFilter` property.
See the [[AsyncRender]] class for additional information.
