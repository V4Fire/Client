- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'super/i-block'|b as placeholder

- template index() extends ['i-block'].index
	- skeletonMarker = true

	- block rootAttrs
		? Object.assign(rootAttrs, {role: 'img', ':aria-label': 'alt'})

	- block body
		- super

		- block overlay
			< .&__overlay
				+= self.slot('overlay')
					< img.&__overlay-img &
						v-if = Object.isString(overlayImg) |
						:src = overlayImg
					.

					< b-image.&__overlay-img &
						v-else-if = Object.isPlainObject(overlayImg) |
						:v-attrs = overlayImg
					.

		- block broken
			< .&__broken
				+= self.slot('broken')
					< img.&__broken-img &
						v-if = Object.isString(brokenImg) |
						:src = brokenImg
					.

					< b-image.&__broken-img &
						v-else-if = Object.isPlainObject(brokenImg) |
						:v-attrs = brokenImg
					.

		- block image
			< .&__img ref = img
