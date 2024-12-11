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

		< b-button @click = () => async.clearAll({group: /test/})
			Destroy

		< hr

		< . v-async-target
			< template v-for = _ in asyncRender.iterate(1, {filter: async.sleep.bind(async, 100), group: 'test'})
				< b-example-issue-one
				< hr
				< b-example-issue-two
				< hr
				< b-example-issue-three
