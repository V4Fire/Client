- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'components/super/i-data'|b as placeholder

- template index() extends ['i-data'].index
	- rootTag = 'form'

	- block rootAttrs
		? Object.assign(rootAttrs, { &
			novalidate: TRUE,
			':id': 'id',
			':name': 'name',
			'@submit.prevent': 'submit'
		}, attrs) .

	- block body
		+= self.slot()
