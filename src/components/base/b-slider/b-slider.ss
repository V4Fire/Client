- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'components/super/i-data'|b as placeholder

- template index() extends ['i-data'].index
	- windowEvents = { &
		'@touchstart': '!useScrollSnap ? onStart($event) : undefined',
		'@touchmove': '!useScrollSnap ? onMove($event) : undefined',
		'@touchend': '!useScrollSnap ? onRelease($event) : undefined'
	} .

	- block body
		: putIn content
			< template v-if = item
				+= self.slot('beforeItems')

				< template v-for = (el, i) in items
					< component.&__option.&__item &
						:is = getItemComponentName(el, i) |
						:key = getItemKey(el, i) |
						:v-attrs = getItemAttrs(el, i)
					.

				+= self.slot('afterItems')

			< template v-else
				+= self.slot()

		+= self.slot('before')

		< .&__window &
			v-if = isSlideMode |
			${windowEvents}
		.
			< .&__view &
				ref = view |
				v-on-resize = {
					watchHeight: false,
					watchWidth: true,
					handler: isSlideMode ? syncStateDefer : undefined
				}
			.
				< .&__view-content ref = content
					+= content

		< .&__window v-else-if = useScrollSnap
			< .g-slider
				+= content

		< .&__window v-else
			< template
				< .&__view ref = view
					< .&__fake-view-content v-if = dynamicHeight
						+= content

					< .&__outer-view-wrapper ref = contentWrapper
						< .&__view-content ref = content
							+= content

		+= self.slot('after')
