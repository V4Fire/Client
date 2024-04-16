- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'components/super/i-dynamic-page'|b as placeholder

- template index() extends ['i-dynamic-page'].index
	- block body
		< b-button.&__button v-func = false
			p-v4-dynamic-page1

		< b-button.&__button-func
			Functional button

		< ul.&__horizontal-scroll ref = horizontalScroll | -testid = horizontalScroll
			< li v-for = i of 50
				Item {{i}}
