/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- namespace [%fileName%]

- include 'components/super/i-data'|b as placeholder

- template index() extends ['i-data'].index
	- block body
		< .&__wrapper
			< .&__item v-for = item in items
				+= self.slot('item', {':item': 'item'})
