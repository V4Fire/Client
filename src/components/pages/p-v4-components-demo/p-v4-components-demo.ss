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
		< b-dummy
			/// No object
			< template v-render = vdom.getRenderFn('b-dummy/')()

			/// Inline object
			< template v-render = vdom.getRenderFn('b-dummy/')({classes: 'test'})

			/// Sparse object
			< template v-render = vdom.getRenderFn('b-dummy/')({ &
				classes: 'test'
			}) .
