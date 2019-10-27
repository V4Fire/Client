- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'super/i-block'|b as placeholder

- template index() extends ['i-block'].index
	- block body
		< template v-for = el in options
			< . &
				:ref = 'matryoshka-' + el.id |

				:class = provide.elClasses({matryoshka: {
					level: el.level,
					folded
				}})
			.
				< .&__doll-box
					< .&__marker
						- block fold
							< template v-if = Boolean(field.get('children.length', el))
								< template v-if = vdom.getSlot('fold')
									+= self.slot('fold', {':option': 'getFoldingProps(el)'})

								< .&__fold &
									v-else |
									@click = onFoldingClick(el)
								.

					- block doll
						+= self.slot('default', {':option': 'getOptionProps(el)'})

				- block children
					< .&__children v-if = field.get('children.length', el)
						< template v-for = e in asyncRender.iterate([el], 1, { &
							filter: () => listFilter(el.id)
						}) .

							< b-matryoshkas.&__child &
								:options = e.children |
								:getOptionProps = getOptionProps |
								:v-attrs = getNestedDollProps()
							.
								< template slot-scope = o
									+= self.slot('default', {':option': 'o.option'})
