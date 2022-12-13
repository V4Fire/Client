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
						...(hasChildren(el) && {folded: getFoldedPropValue(el)})
					}
				})
			.
				< .&__item-wrapper :v-attrs = getItemAttrs(el)
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
							ref = children |
							:items = el.children |
							:folded = getFoldedPropValue(el) |
							:item = item |
							:v-attrs = nestedTreeProps |
							:itemProps = itemProps
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
