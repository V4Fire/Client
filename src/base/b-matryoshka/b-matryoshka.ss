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
		< template v-for = el in top.asyncRender.iterate(options, top.renderChunks, { &
			filter: renderFilter
		}) .
			< . &
				:-id = top.dom.getId(el.id) |
				:class = provide.elClasses({matryoshka: {
					level,
					folded
				}})
			.
				< .&__doll-box
					< .&__marker
						- block fold
							< template v-if = Boolean(field.get('children.length', el))
								< template v-if = vdom.getSlot('fold')
									+= self.slot('fold', {':params': 'getFoldingProps(el)'})

								< .&__fold &
									v-else |
									:v-attrs = getFoldingProps(el)
								.

					- block doll
						< template v-if = option
							< component.&__option &
								:is = option |
								:v-attrs = getOptionProps(el, i)
							.

						< template v-else
							+= self.slot('default', {':option': 'getOptionProps(el, i)'})

				- block children
					< .&__children v-if = field.get('children.length', el)
						< @b-matryoshka.&__child &
							:options = el.children |
							:v-attrs = getNestedDollProps()
						.
							< template slot-scope = o
								+= self.slot('default', {':option': 'o.option'})
