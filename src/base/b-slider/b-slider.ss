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

			< template v-if = slide
				< template &
					v-for = (el, i) in slidesIterator ? slidesIterator(slides, self) : slides |
					:key = slideKey
				.
					< component.&__slide &
						:is = slide |
						:v-attrs = Object.isFunction(slideProps) ? slideProps(el, i) : slideProps
					.

			< template v-else
				+= self.slot()

			+= self.slot('after')

		< .&__window &
			v-if = isSlider |
			${windowEvents}
		.
			< .&__view ref = view
				< .&__view-content ref = content
					+= content

		< .&__window v-else
			< .&__view-content ref = view
				< .&__fake-view-content &
					v-if = dynamicHeight |
					ref = fake |
				.
					+= content

				< .&__outer-view-wrapper
					< .&__view-content ref = content
						+= content
