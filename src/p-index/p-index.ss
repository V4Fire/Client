- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'super/i-page/i-page.component.ss'|b as placeholder

- template index() extends ['i-page.component'].index
	- block body
		< b-textarea
