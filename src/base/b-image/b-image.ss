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
		? Object.assign(rootAttrs, {role: 'img', ':aria-label': 'alt', marker: true})

	- block body
		- super

		- block overlay
			< .&__overlay
				+= self.slot('overlay')
					< template v-if = Object.isString(overlayImg)
						< img.&__overlay-img :src = overlayImg

					< template v-else-if = Object.isObject(overlayImg)
						< b-image.&__overlay-img :v-attrs = overlayImg

		- block broken
			< .&__broken
				+= self.slot('broken')
					< template v-if = Object.isString(brokenImg)
						< img.&__broken-img :src = brokenImg

					< template v-else-if = Object.isObject(brokenImg)
						< b-image.&__broken-img :v-attrs = brokenImg

		- block image
			< .&__img ref = img
