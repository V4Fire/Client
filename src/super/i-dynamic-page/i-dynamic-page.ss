- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'super/i-page'|b as placeholder

- template index() extends ['i-page'].index
	- block innerRoot
		< .&__root-wrapper
			- block body

		- block helpers
		- block providers
