/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- namespace [%fileName%]

- include 'super/i-data'|b as placeholder

- template index() extends ['i-data'].index
	- windowEvents = { &
		'@touchstart': 'onStart',
		'@touchmove': 'onMove',
		'@touchend': 'onRelease'
	} .

	- block body
		: putIn content
			+= self.slot('before')

			< template v-if = $scopedSlots.default
				+= self.slot()

			< template v-else-if = option
				< template v-for = el in options
					< component.&__option &
						:is = option |
						:v-attrs = Object.isFunction(optionProps) ? optionProps(el) : optionProps
					.

			+= self.slot('after')

		< .&__window &
			v-if = isSlider |
			${windowEvents}
		.
			< .&__view ref = view
				< .&__view-wrapper ref = wrapper
					+= content

		< .&__window v-else
			< .&__view-wrapper ref = view
				< .&__fake-view-wrapper &
					v-if = dynamicHeight |
					ref = fake |
				.
					+= content

				< .&__outer-view-wrapper
					< .&__view-wrapper ref = wrapper
						+= content
