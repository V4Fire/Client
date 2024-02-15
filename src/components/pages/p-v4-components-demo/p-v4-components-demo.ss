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
	- block helpers
		- block router
			< b-router &
				v-once |
				:initialRoute = "page1"
			.

	- block body
		< h1
			Active page: {{ activePage }}

		< hr

		< b-button :type = 'link' | :href = '/page1'
			Page1
		< b-button :type = 'link' | :href = '/page2'
			Page2
		< b-button :type = 'link' | :href = '/page3'
			Page3

		< hr

		< b-dynamic-page :keepAlive = true
