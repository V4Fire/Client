- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'components/super/i-page'|b as placeholder

- template index() extends ['i-page'].index
	- block rootAttrs
		? Object.assign(rootAttrs, {'id': 'root-component'})

	- block innerRoot
		- block helpers
		- block providers

		- block bodyHeader

		< .&__root-wrapper[.page-wrapper]
			- block body

		- block bodyFooter
