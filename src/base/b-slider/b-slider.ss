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

			< template v-if = option
				< template &
					v-for = (el, i) in optionsIterator ? optionsIterator(options, self) : options |
					:key = getOptionKey(el, i)
				.
					< component.&__option &
						:is = option |
						:v-attrs = Object.isFunction(optionProps) ? optionProps(el, i, getOptionKey(el, i)) : optionProps
					.

			< template v-else
				+= self.slot()

		+= self.slot('before')

		< .&__window &
			v-if = isSlider |
			${windowEvents}
		.
			< .&__view &
				ref = view |
				v-resize = syncStateDefer
			.
				< .&__view-content ref = content
					+= content

		< .&__window v-else
			< .&__view-content ref = view
				< .&__fake-view-content &
					v-if = dynamicHeight |
					ref = fake
				.
					+= content

				< .&__outer-view-wrapper
					< .&__view-content ref = content
						+= content

		+= self.slot('after')
