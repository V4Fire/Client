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
	- windowEvents = { &
		'@touchstart': 'onStart',
		'@touchmove': 'onMove',
		'@touchend': 'onRelease'
	} .

	- block body
		: putIn content
			+= self.slot('before')

			< template v-if = option
				< template &
					v-for = (el, i) in optionsIterator ? optionsIterator(options, self) : options |
					:key = optionKey
				.
					< component.&__option &
						:is = option |
						:v-attrs = Object.isFunction(optionProps) ? optionProps(el, i) : optionProps
					.

			< template v-else
				+= self.slot()

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
