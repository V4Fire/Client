- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'super/i-message'|b as placeholder

- template index() extends ['i-message'].index
	- rootWrapper = false

	- block rootAttrs
		? Object.assign(rootAttrs, {role: 'img', ':aria-label': 'alt'})

	- block body
		- super

		- block overlay
			< .&__overlay
				+= self.slot('overlay')

		- block broken
			< .&__broken
				+= self.slot('broken')

		- block image
			< .&__img ref = img
