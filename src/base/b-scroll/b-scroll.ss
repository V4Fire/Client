- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'super/i-block'|b as placeholder

- template index() extends ['i-block'].index
	- rootWrapper = true

	- block body
		- super

		/**
		 * Generates a scroller
		 * @param {string} side - scroller side
		 */
		- block scroll(side)
			: up = side.toUpperCase()
			< _.&__scroll-wrapper.&__scroll-wrapper-${side} ref = scrollWrapper${up}
				< _.&__scroll.&__scroll-${side}
					< _.&__scroller.&__scroller-${side} ref = scroller${up} | v-e:dnd = { &
						onDragStart: onScrollerDragStart,
						onDrag: onScrollerDrag,
						onScrollerDragEnd: onScrollerDragEnd
					} .

		- block scrollY
			+= self.scroll('y')

		- block area
			< _.&__area ref = area | @scroll = onScroll
				< slot

		- block scrollX
			+= self.scroll('x')
