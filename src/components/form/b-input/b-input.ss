- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'components/super/i-input-text'|b as placeholder

- template index() extends ['i-input-text'].index
	- rootTag = 'span'
	- rootWrapper = true

	- block body
		- super

		- block wrapper
			< _.&__wrapper @click = focus
				- block preIcon
					< _.&__cell.&__icon.&__pre-icon v-if = $slots['preIcon']
						+= self.slot('preIcon', { &
							':icon': 'preIcon',
							':hint': 'preIconHint',
							':hintPos': 'preIconHintPos'
						}) .

					< _.&__cell.&__icon.&__pre-icon v-else-if = preIcon
						< _.g-hint &
							:-hint = preIconHint |
							:class = preIconHintPos && provide.fullComponentName('g-hint', 'pos', preIconHintPos)
						.
							< component &
								v-if = preIconComponent |
								:is = preIconComponent |
								:value = preIcon
							.

							< .g-icon v-else | v-icon:[preIcon]

				- block input
					< _.&__cell.&__input-wrapper
						+= self.nativeInput({attrs: {'@input': 'onEdit'}})

						< span.&__text-hint &
							v-if = hasTextHint |
							ref = textHint
						.
							{{ textHintWithIndent }}

				- block icon
					< _.&__cell.&__icon.&__post-icon v-if = $slots['icon']
						+= self.slot('icon', { &
							':icon': 'icon',
							':hint': 'iconHint',
							':hintPos': 'iconHintPos'
						}) .

					< _.&__cell.&__icon.&__post-icon v-else-if = icon
						< _.g-hint &
							:-hint = iconHint |
							:class = iconHintPos && provide.fullComponentName('g-hint', 'pos', iconHintPos)
						.
							< component &
								v-if = iconComponent |
								:is = iconComponent |
								:value = icon
							.

							< .g-icon v-else | v-icon:[icon]

				- block clear
					< _.&__cell.&__icon.&__clear @mousedown.prevent | @click = onClear

				- block progress
					< _.&__cell.&__icon.&__progress v-if = progressIcon != null || $slots['progressIcon']
						+= self.slot('progressIcon', {':icon': 'progressIcon'})
							< component &
								v-if = Object.isString(progressIcon) |
								:is = progressIcon
							.

							< b-progress-icon v-else

				- block validation
					< _.&__cell.&__icon.&__valid-status.&__valid
					< _.&__cell.&__icon.&__valid-status.&__invalid

				- block icons
