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
			v-for = (el, i) in asyncRender.iterate(items, renderChunks, renderTaskParams) |
			:key = getItemKey(el, i)
		.
			< .&__node &
				:-id = dom.getId(el.id) |
				:-level = level |
				:class = provide.elClasses({
					node: {
						level,
						folded: getFoldedPropValue(el)
					}
				})
			.
				< .&__item-wrapper
					< .&__marker
						- block fold
							< template v-if = Object.size(field.get('children.length', el)) > 0
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
					< .&__children v-if = Object.size(field.get('children', el)) > 0
						< b-tree.&__child &
							:items = el.children |
							:folded = getFoldedPropValue(el) |
							:item = item |
							:v-attrs = nestedTreeProps
						.
							< template &
								#default = o |
								v-if = vdom.getSlot('default') != null
							.
								+= self.slot('default', {':item': 'o.item'})

							< template &
								#fold = o |
								v-if = vdom.getSlot('fold') != null
							.
								+= self.slot('fold', {':params': 'o.params'})
