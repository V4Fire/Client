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
					< _.&__cell.&__icon.&__pre-icon v-if = $slots['pre-icon']
						+= self.slot('pre-icon')

					< _.&__cell.&__icon.&__pre-icon v-else-if = preIcon
						< component.&__b-icon &
							v-if = preIconComponent || hint |
							:instanceOf = bIcon |
							:is = preIconComponent |
							:value = preIcon || 'b-icon' |
							:hint = hint
						.

						< template v-else
							+= self.gIcon(['preIcon'], {'g-icon': {}})

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
					< _.&__cell.&__icon.&__post-icon v-if = $slots.icon
						+= self.slot('icon')

					< _.&__cell.&__icon.&__post-icon v-else-if = icon
						< component.&__b-icon &
							v-if = iconComponent || hint |
							:instanceOf = bIcon |
							:is = iconComponent || 'b-icon' |
							:value = icon |
							:hint = hint
						.

						< template v-else
							+= self.gIcon(['icon'], {'g-icon': {}})

				- block progress
					< _.&__cell.&__icon.&__progress v-if = dataProvider
						< b-progress-icon v-once
