/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- namespace [%fileName%]

- include 'super/i-block'|b as placeholder

- template index() extends ['i-block'].index
	- overWrapper = false

	- windowEvents = { &
		'@touchstart': 'onStart',
		'@touchmove': 'onMove',
		'@touchend': 'onRelease'
	} .

	- block body
		< .&__window &
			v-if = isSlider |
			${windowEvents}
		.
			< .&__view ref = view
				< .&__view-wrapper ref = wrapper
					+= self.slot()

		< .&__window v-else
			< .&__view-wrapper ref = view
				< .&__fake-view-wrapper ref = fake
					+= self.slot()
				< .&__outer-view-wrapper
					< .&__view-wrapper ref = wrapper
						+= self.slot()
