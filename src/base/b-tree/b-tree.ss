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
		< template v-for = (el, i) in top.asyncRender.iterate(options, top.renderChunks, { &
			filter: renderFilter
		}) .
			< .&__node &
				:-id = top.dom.getId(el.id) |
				:-level = level |
				:class = provide.elClasses({node: {level, folded}})
			.
				< .&__item-wrapper
					< .&__marker
						- block fold
							< template v-if = Object.size(field.get('children.length', el)) > 0
								< template v-if = vdom.getSlot('fold') != null
									+= self.slot('fold', {':params': 'getFoldingProps(el)'})

								< .&__fold &
									v-else |
									:v-attrs = getFoldingProps(el)
								.

					- block item
						< template v-if = option != null
							< component.&__option &
								:is = Object.isFunction(option) ? option(el, i) : option |
								:v-attrs = getOptionProps(el, i)
							.

						< template v-else
							+= self.slot('default', {':option': 'getOptionProps(el, i)'})

				- block children
					< .&__children v-if = Object.size(field.get('children', el)) > 0
						< @b-tree.&__child &
							:options = el.children |
							:option = option |
							:v-attrs = getNestedItemProps
						.
							< template #default = o
								+= self.slot('default', {':option': 'o.option'})

							< template #fold = o | v-if = vdom.getSlot('fold') != null
								+= self.slot('fold', {':params': 'o.params'})
