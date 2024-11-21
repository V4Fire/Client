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

		< b-button @click:component = () => async.clearAll({group: /hello/})
			Clear async

		< .async-1 v-async-target | :style = {background: 'cyan'}
			< template v-for = _ in asyncRender.iterate(1, {filter: (el) => async.sleep(100), group: 'hello'})
				< b-button
					Functional button

				< div
