- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'super/i-data'|b as placeholder

- template index() extends ['i-data'].index
	- block body
		- super
		< .&__tooltip v-if = showTooltip && permission !== 'granted' && isReady
			{{ title + ` needs your permission to` }}

			< a:void.&__enable @click = requestPermissions()
				{{ `enable desktop notifications` }}

			< button:a.&__close @click = setMod('hidden', true)
				< @b-icon :value = 'clear'
