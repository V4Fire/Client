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
				+= self.slot('beforeOptions')

				< template &
					v-for = (el, i) in optionsIterator ? optionsIterator(options, self) : options |
					:key = getOptionKey(el, i)
				.

					< component.&__option &
						:is = option |
						:v-attrs = Object.isFunction(optionProps) ? optionProps(el, i, {
							key: getOptionKey(el, i),
							ctx: self
						}) : optionProps
					.

				+= self.slot('afterOptions')

			< template v-else
				+= self.slot()

		+= self.slot('before')

		< .&__window &
			v-if = isSlider |
			${windowEvents}
		.
			< .&__view &
				ref = view |
				v-resize.width = isSlider ? syncStateDefer : undefined
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
