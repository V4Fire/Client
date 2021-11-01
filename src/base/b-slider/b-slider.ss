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
			< template v-if = item || option
				/*
				 * @deprecated
				 * @see beforeItems
				 */
				+= self.slot('beforeOptions')

				+= self.slot('beforeItems')

				< template &
					v-for = (el, i) in items |
					:key = getItemKey(el, i)
				.
					< component.&__option.&__item &
						:is = getItemComponentName(el, i) |
						:v-attrs = getItemAttrs(el, i)
					.

				/*
				 * @deprecated
				 * @see afterItems
				 */
				+= self.slot('afterOptions')

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
				v-resize-observer = {
					watchHeight: false,
					watchWidth: true,
					callback: isSlideMode ? syncStateDefer : undefined
				}
			.
				< .&__view-content ref = content
					+= content

		< .&__controls
			< template &
				v-for = index in getControlAmount() |
				:key = index
			.
				+= self.slot('control')
					< .&__control &
						:class = provide.elClasses({current: {active: index - 1 === current}}) |
						@click = onControlClick(index)
					.

		< .&__window v-else
			< .&__view ref = view
				< .&__fake-view-content v-if = dynamicHeight
					+= content

				< .&__outer-view-wrapper ref = contentWrapper
					< .&__view-content ref = content
						+= content

		+= self.slot('after')
