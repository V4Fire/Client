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
	- block body
		< .&__simple-array-rendering
			< template v-for = el in asyncRender.iterate([1, 2, 3, 4])
				Element: {{ el }}; Hook: {{ hook }}; {{ '' }}

		< .&__array-rendering-with-chunk-size
			< template v-for = el in asyncRender.iterate([1, 2, 3, 4], 3)
				Element: {{ el }}; Hook: {{ hook }}; {{ '' }}

		< .&__range-rendering-by-click
			< template v-for = el in asyncRender.iterate(1, { &
				filter: (el, i) => promisifyOnce('range-rendering-by-click')
			}) .
				Element: {{ el }}; Hook: {{ hook }}; {{ '' }}

		< button.&__range-rendering-by-click-btn @click = emit('range-rendering-by-click')

