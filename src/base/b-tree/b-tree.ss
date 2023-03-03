- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'super/i-data'|b as placeholder

- template index() extends ['i-data'].index
	- block body
		< template v-for = (el, i) in asyncRender.iterate(items, renderChunks, renderTaskParams)
			< .&__node &
				:key = getItemKey(el, i) |

				:-id = valueIndexes.get(el.value) |
				:-level = level |

				:class = provide.elClasses({
					node: {
						level,
						id: valueIndexes.get(el.value),
						active: isActive(el.value),
						...(hasChildren(el) && {folded: getFoldedPropValue(el)}),
						...el.mods
					}
				})
			.
				< .&__item-wrapper
					< .&__marker
						- block fold
							< template v-if = hasChildren(el)
								+= self.slot('fold', {':params': 'getFoldProps(el)'})
									< .&__fold :v-attrs = getFoldProps(el)

					- block item
						+= self.slot('default', {':item': 'getItemProps(el, i)'})
							< component.&__item &
								v-if = item |
								:is = Object.isFunction(item) ? item(el, i) : item |
								:v-attrs = getItemProps(el, i)
							.

				- block children
					< .&__children v-if = hasChildren(el)
						< b-tree.&__child &
							v-func = nestedTreeProps.dataProvider == null |
							ref = children |

							:item = item |
							:items = el.children |
							:itemProps = itemProps |

							:folded = getFoldedPropValue(el) |
							:v-attrs = nestedTreeProps
						.
							< template &
								#default = o |
								v-if = vdom.getSlot('default')
							.
								+= self.slot('default', {':item': 'o.item'})

							< template &
								#fold = o |
								v-if = vdom.getSlot('fold')
							.
								+= self.slot('fold', {':params': 'o.params'})
