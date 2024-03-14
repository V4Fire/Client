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
		< button @click = asyncRender.forceRender()
			Button

		< .container v-async-target
			< template v-for = _ in asyncRender.iterate(true, {filter: asyncRender.waitForceRender('item')})
				< .&__item
					test
