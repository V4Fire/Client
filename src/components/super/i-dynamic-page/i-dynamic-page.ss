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
	- rootTag = 'main'
	- block body
		< p
			Mount counter: {{mountCounter}}
