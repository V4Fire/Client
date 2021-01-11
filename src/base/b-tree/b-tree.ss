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
		< template &
			v-for = (el, i) in top.asyncRender.iterate(
				items,
				top.renderChunks,
				{filter: renderFilter}
			) |

			:key = getItemKey(el, i)
		.
			< .&__node &
				:-id = top.dom.getId(el.id) |
				:-level = level |
				:class = provide.elClasses({
					node: {
						level,
						folded: el.folded != null ? el.folded : top.folded
					}
				})
			.
				< .&__item-wrapper
					< .&__marker
						- block fold
							< template v-if = Object.size(field.get('children.length', el)) > 0
								< template v-if = vdom.getSlot('fold') != null
									+= self.slot('fold', {':params': 'getFoldProps(el)'})

								< .&__fold &
									v-else |
									:v-attrs = getFoldProps(el)
								.

					- block item
						< template v-if = item != null
							< component.&__item &
								:is = Object.isFunction(item) ? item(el, i) : item |
								:v-attrs = getItemProps(el, i)
							.

						< template v-else
							+= self.slot('default', {':item': 'getItemProps(el, i)'})

				- block children
					< .&__children v-if = Object.size(field.get('children', el)) > 0
						< @b-tree.&__child &
							:items = el.children |
							:folded = el.folded != null ? el.folded : top.folded |
							:item = item |
							:v-attrs = nestedTreeProps
						.
							< template #default = o
								+= self.slot('default', {':item': 'o.item'})

							< template #fold = o | v-if = vdom.getSlot('fold') != null
								+= self.slot('fold', {':params': 'o.params'})
