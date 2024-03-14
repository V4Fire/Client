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
		< .&__items-wrapper v-async-target
			< template v-for = _ in asyncRender.iterate(testDb)
				renderCount: {{ renderCount }}

				< . &
					v-if = testDb[renderCount] |
					:ref = testDb[renderCount].value
				.
					Item value: {{ testDb[renderCount].value }}

					{{ void(renderCount++) }}
