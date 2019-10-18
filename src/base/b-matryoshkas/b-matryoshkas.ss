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
			< . :class = provide.elClasses({matryoshka: {level: el.level}})
				< .&__left-side
					- block fold
						< template v-if = Boolean(field.get('children.length', el))
							< template v-if = vdom.getSlot('fold')
								+= self.slot('fold', {':option': 'getFoldingProps()'})

							< .&__fold &
								v-else |
								@click = onFoldingClick
							.

				- block doll
					< template v-if = vdom.getSlot('default')
						+= self.slot('default', {':option': 'getOptionProps(el)'})

					< template v-else
						< component &
							:ref = 'matryoshka-' + el.id |
							:instanceOf = bCheckbox |
							:is = option |
							:p = el |
							:key = el.id || el.name |
							:v-attrs = getOptionProps(el)
						.

			- block children
				< .&__children v-if = field.get('children.length', el)
					< b-matryoshkas.&__child &
						:options = el.children |
						:option = option |
						:getOptionProps = getOptionProps
					.
						< template slot-scope = o | v-if = vdom.getSlot('default')
							+= self.slot('default', {':option': 'o.option'})
