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
		< template v-if = stage === 'teleports'
			< b-bottom-slide

		< template v-if = stage?.startsWith('refs:')
			< b-directives-ref-dummy :stage = stage.split(':')[1]

		< template v-if = stage?.startsWith('refs-async:')
			< b-directives-ref-dummy :useAsyncRender = true | :stage = stage.split(':')[1]
