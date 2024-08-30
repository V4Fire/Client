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
		< b-virtual-scroll-new &
			:item = 'b-button-functional' |
			:items = [{}] |
			:itemProps = () => ({mods: {upper: false}})
		.
		< template v-if = stage === 'teleports'
			< b-bottom-slide
