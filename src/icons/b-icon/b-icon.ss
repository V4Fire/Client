- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'super/i-block'|b as placeholder

- template index(params) extends ['i-block'].index
	- rootTag = 'span'

	- block body
		< svg.&__svg
			< slot name = svgLink
