- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'form/b-checkbox'|b as placeholder

- template index() extends ['b-checkbox'].index
	- hiddenInputType = "'radio'"

	- block check
		< .&__check
