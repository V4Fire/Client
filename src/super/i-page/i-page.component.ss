- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'super/i-block'|b as placeholder

/**
 * Base page component template
 */
- template index() extends ['i-block'].index
	- overWrapper = false

	- block innerRoot
		< [.page-wrapper]
			- block body

		- block helpers
