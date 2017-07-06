- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'super/i-base'|b as placeholder

/**
 * Base page component template
 */
- template index() extends ['i-base'].index
	- block root
		< ?.${self.name()}
			< [.page-wrapper]
				- block body
