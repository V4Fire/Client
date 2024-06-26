- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'components/super/i-block'|b as placeholder

- template index() extends ['i-block'].index
	- block body
		< b-button.target v-func = false | ref = button1

		< b-bottom-slide
			< b-button.target v-func = false | ref = button2
