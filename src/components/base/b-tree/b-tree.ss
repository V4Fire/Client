- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'components/super/i-data'|b as placeholder

- template index() extends ['i-data'].index
	- block rootAttrs
		- super
		? rootAttrs['v-async-target'] = TRUE

	- block body
		< template v-for = (el, i) in ( &
			lazyRender === false || lazyRender === 'folded' ?
				items :
				asyncRender.iterate(items, renderChunks, renderTaskParams)
		) .
			< .&__node &
				:key = getItemKey(el, i) |

				:-id = values.getIndex(el.value) |
				:-level = level |

				:class = provide.elementClasses({
					node: {
						level,
						id: values.getIndex(el.value),
						active: isActive(el.value),
						...(hasChildren(el) && {folded: getFoldedPropValue(el)})
					}
				})
			.
				- block itemWrapper
					< .&__item-wrapper
						< .&__marker
							- block fold
								< template v-if = hasChildren(el)
									+= self.slot('fold', {':params': 'getFoldProps(el)'})
										< .&__fold v-attrs = getFoldProps(el)

						- block item
							+= self.slot('default', {':item': 'getItemProps(el, i)'})
								< component.&__item &
									:is = Object.isFunction(item) ? item(el, i) : item |
									v-if = item |
									v-attrs = getItemProps(el, i)
								.

				- block children
					< .&__children v-if = hasChildren(el) | v-async-target
						+= self.render({wait: 'getNestedTreeFilter(el)'})
							< b-tree.&__child &
								ref = children |
								v-func = true |

								:items = el.children |
								:item = item |
								:itemProps = itemProps |
								:folded = getFoldedPropValue(el) |

								v-attrs = nestedTreeProps
							.
								< template &
									#default = o |
									v-if = $slots['default']
								.
									+= self.slot('default', {':item': 'o.item'})

								< template &
									#fold = o |
									v-if = $slots['fold']
								.
									+= self.slot('fold', {':params': 'o.params'})
