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
				< .&__el v-for = el in options | :key = el.id || el.name
					- block checkbox
						< template v-if = vdom.getSlot('default')
							+= self.slot('default', { &
								':option': 'getOptionProps(el)',
								':onChange': 'onChange',
								':onActionChange': 'onActionChange',
							}) .

						< template v-else
							< component.&__checkbox &
								:instanceOf = bCheckbox |
								:-name = el.name |
								:is = option |
								:p = el |
								:v-attrs = getOptionProps(el) |
								@change = onChange |
								@actionChange = onActionChange
							.
