- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'components/super/i-block'|b as placeholder

- template index() extends ['i-block'].index
	- block body
		< .&__wrapper v-async-target
			< template v-for = _ in asyncRender.iterate(true, { &
				filter: asyncRender.waitForceRender('test'),
			}) .
				Test
