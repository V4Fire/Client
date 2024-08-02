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
		< b-button :opened = undefined
			regular

		< b-button v-attrs = {opened: undefined}
			v-attrs

		< template v-if = stage === 'teleports'
			< b-bottom-slide
