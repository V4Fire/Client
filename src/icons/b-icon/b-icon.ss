- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'super/i-block'|b as placeholder

- template index() extends ['i-block'].index
	- rootTag = 'svg'

	- block body
		< use v-if = value | v-update-on = [ &
			{
				emitter: getIconLink(value),
				listener: (el, v) => el.setAttribute('xlink:href', v)
			}
		] .
