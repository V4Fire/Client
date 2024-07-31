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
		< b-non-effect-prop-dummy :data = computedData

		< b-non-effect-prop-dummy :data = someField

		< button @click = onClick
			Change state
		< template v-if = stage === 'teleports'
			< b-bottom-slide
