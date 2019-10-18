- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'super/i-input'|b as placeholder

- template index() extends ['i-input'].index
	- rootWrapper = true
	- skeletonMarker = false

	- block body
		- super

		- block input
			+= self.hiddenInput()

		- block list
			< .&__list
				< b-matryoshkas &
					:options = options |
					:getOptionProps = getOptionProps
				.
					< template slot-scope = o
						< template v-if = vdom.getSlot('default')
							+= self.slot('default', {':option': 'o.option'})

						< component &
							v-else |
							:ref = 'matryoshka-' + o.option.id |
							:instanceOf = bCheckbox |
							:is = option |
							:p = o.option |
							:key = o.option.id || o.option.name |
							:v-attrs = getOptionProps(o.option)
						.
