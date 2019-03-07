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
	- rootWrapper = true

	- block body
		- super
		- block wrapper
			< _.&__wrapper @click = onClick
				- block preIcon
					< _.&__cell.&__icon.&__pre-icon v-if = preIcon
						< component.&__b-icon &
							v-if = preIconComponent || hint |
							:instanceOf = bIcon |
							:is = preIconComponent |
							:value = preIcon || 'b-icon' |
							:hint = hint
						.

						< template v-else
							< @b-icon :value = preIcon

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
						< component.&__b-icon &
							v-if = iconComponent || hint |
							:instanceOf = bIcon |
							:is = iconComponent || 'b-icon' |
							:value = icon |
							:hint = hint
						.

						< template v-else
							< @b-icon :value = icon

				- block progress
					< _.&__cell.&__icon.&__progress
						< @b-progress-icon
