- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'components/super/i-static-page/i-static-page.component.ss'|b as placeholder

- template index() extends ['i-static-page.component'].index
	- block body
		< b-bottom-slide &
			:steps = [30,50,60] |
			:hideWithDelay = false |
			:overlay = false |
			:visible = 92 |
			:heightMode = 'content'
		.
			< .&__content
			hello world
