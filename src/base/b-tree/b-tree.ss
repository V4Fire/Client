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
			v-for = (item, i) in asyncRender.iterate(items, renderChunks, renderTaskParams) |
			:key = getItemKey(item, i)
		.
			< .&__node &
				:-id = dom.getId(item.id) |
				:-level = level |
				:class = provide.elClasses({
					node: {
						level,
						folded: getFoldedPropValue(item)
					}
				})
			.
				< .&__item-wrapper
					< .&__marker
						- block fold
							< template v-if = Object.size(field.get('children.length', item)) > 0
								< template v-if = vdom.getSlot('fold') != null
									+= self.slot('fold', {':params': 'getFoldProps(item)'})

								< .&__fold &
									v-else |
									:v-attrs = getFoldProps(item)
								.

					- block item
						< template v-if = item != null
							< component.&__item &
								:is = Object.isFunction(item) ? item(item, i) : item |
								:v-attrs = getItemProps(item, i)
							.

						< template v-else
							+= self.slot('default', {':item': 'getItemProps(item, i)'})

				- block children
					< .&__children v-if = Object.size(field.get('children', item)) > 0
						< b-tree.&__child &
							:items = item.children |
							:folded = getFoldedPropValue(item) |
							:item = item |
							:v-attrs = nestedTreeProps
						.
							< template #default = o
								+= self.slot('default', {':item': 'o.item'})

							< template #fold = o | v-if = vdom.getSlot('fold') != null
								+= self.slot('fold', {':params': 'o.params'})
