- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'components/super/i-data'|b as placeholder

- template index() extends ['i-data'].index
	- forceRenderAsVNode = true

	- block rootAttrs
		- super
		? rootAttrs['v-async-target'] = TRUE

	- block body
		< template v-for = _ in asyncRender.iterate(1, {filter: async.sleep.bind(async, 100), useRAF: true})
			< div
				< div v-hook = {unmounted: () => console.log('v-hook 1 unmount called')}
				/// Delete component below and v-hook will start working
				/// NOTE: The functional component is intentional!
				< b-button-functional
