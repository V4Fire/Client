- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'dummies/b-dummy'|b as placeholder

- template index() extends ['b-dummy'].index
	- block body
		< ul.&__scrollable ref = scrollable | -testid = scrollable
			< li
				Scrollable item
