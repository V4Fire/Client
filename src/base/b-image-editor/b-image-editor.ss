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
	- rootWrapper = true

	- block body
		- super
		- block editor
			< .&__super-wrapper
				< b-crop.&__crop &
					ref = crop |
					v-if = tools.crop |
					:src = src |
					:width = width |
					:height = height |
					:alt = alt |
					:minWidth = tools.crop.minWidth |
					:minHeight = tools.crop.minHeight |
					:clickWidth = tools.crop.clickWidth |
					:clickHeight = tools.crop.clickHeight |
					:ratio = tools.crop.ratio |
					:ratably = tools.crop.ratably |
					:freeSelect = tools.crop.freeSelect |
					:selectByClick = tools.crop.freeSelect |
					:resizeSelect = tools.crop.resizeSelect |
					:moveSelect = tools.crop.moveSelect |
					:dispatching = true
				.

				< img.&__img &
					ref = img |
					v-else |
					:src = src |
					:width = width |
					:height = height |
					:alt = alt
				.

				< .&__wrapper

				< .&__controls
					< .&__control v-if = tools.rotate.left | @click = rotate('left')
						< b-icon :value = 'rotate-left'

					< .&__control v-if = tools.rotate.right | @click = rotate('right')
						< b-icon :value = 'rotate-right'
