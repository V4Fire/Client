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

	- block body
		< div v-hook = {unmounted: () => console.log('iiii')}

		< template v-if = true
			< b-progress-icon
