- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'components/dummies/b-dummy'|b as placeholder

- template index() extends ['b-dummy'].index
	- rootTag = 'button'

	- block rootAttrs
		? Object.assign(rootAttrs, { &
			'@click': 'onClick'
		}, attrs) .

	- block body
		Click!
