- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'super/i-data'|b as placeholder

/**
 * Base page component template
 */
- template index() extends ['i-data'].index
	- overWrapper = false

	- block innerRoot
		< .&__root-wrapper[.page-wrapper]
			- block body

		- block helpers
		- block providers
