- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'super/i-data'|b as placeholder

- template index() extends ['i-data'].index
	- rootTag = 'span'
	- messageHelpers = true

	- block body
		- super
		- block wrapper
			< _.&__wrapper @click = onClick
				- block preIcon
					< _.&__cell.&__icon.&__pre-icon v-if = preIcon
						< component &
							:instanceOf = bIcon |
							:is = preIconComponent |
							:value = preIcon |
							:hint = hint
						.

				- block link
					< a.&__cell.&__link &
						ref = link |
						:href = href |
						:class = setHint(hintPos) |
						:-hint = t(hint) |
						${attrs|!html}
					.
						< slot

				- block icon
					< _.&__cell.&__icon.&__post-icon v-if = icon
						< component &
							:instanceOf = bIcon |
							:is = iconComponent |
							:value = icon |
							:hint = hint
						.

				- block progress
					< _.&__cell.&__icon.&__progress v-if = !isFunctional
						< b-progress-icon v-once
