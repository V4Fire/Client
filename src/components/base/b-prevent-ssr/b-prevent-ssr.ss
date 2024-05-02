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
	- block innerRoot
		< template v-if = ssrRendering
			+= self.slot()

	- block skeleton
		< template v-if = !ssrRendering
			+= self.slot('skeleton')
