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
			- block doll
				< template v-if = vdom.getSlot('default')
					+= self.slot('default', {':option': 'getOptionProps(el)'})

				< template v-else
					< component.&__child &
						:ref = 'matryoshka-' + el.id |
						:instanceOf = bCheckbox |
						:is = option |
						:p = el |
						:key = el.id || el.name |
						:v-attrs = getOptionProps(el)
					.

			< template v-if = field.get('children.length', el)
				< b-matryoshkas &
					:options = el.children |
					:option = option |
					:childAttrsFn = childAttrsFn
				.
					< template slot-scope = o | v-if = vdom.getSlot('default')
						+= self.slot('default', {':option': 'o.option'})
