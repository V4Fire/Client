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
	- block body
		- super
		- block progress
			< .&__progress
				< b-progress-icon

		- block crop
			< .&__area ref = area
				< .&__select ref = select
					< .&__r[.&_hor-align_left.&_vert-align_top] ref = r
					< .&__r[.&_hor-align_left.&_vert-align_bottom]
					< .&__r[.&_hor-align_right.&_vert-align_top]
					< .&__r[.&_hor-align_right.&_vert-align_bottom]

					< template v-if = ratably
						< .&__r[.&_hor-align_left.&_vert-align_middle]
						< .&__r[.&_hor-align_right.&_vert-align_middle]
						< .&__r[.&_hor-align_middle.&_vert-align_top]
						< .&__r[.&_hor-align_middle.&_vert-align_bottom]

				< .&__clone ref = clone
					< img.&__img &
						:src = src |
						:width = width |
						:height = height |
						:alt = alt
					.

			< .&__original ref = original
				< img.&__img &
					ref = img |
					:src = src |
					:width = width |
					:height = height |
					:alt = alt
				.
