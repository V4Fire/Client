/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- namespace [%fileName%]

- include 'super/i-message'|b as placeholder

- template index() extends ['i-message'].index
	- block body
		< .&__content
			+= self.slot()
