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
	- rootWrapper = true

	- block body
		- super
		< .&__up
			< @b-icon :value = 'arrow_drop_up'

		< button:a.&__a
			{{ `Up` }}
