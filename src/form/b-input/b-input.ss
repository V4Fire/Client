- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'super/i-input'|b as placeholder

- template index() extends ['i-input'].index
	- rootTag = 'span'

	- block body
		- super
		< _.&__super-wrapper ref = superWrapper | @click = focus
			- block wrapper
				< _.&__wrapper
					- block preIcon
						< _.&__cell.&__icon.&__pre-icon v-if = preIcon
							< component &
								:instanceOf = bIcon |
								:is = preIconComponent |
								:value = preIcon |
								:hint = preIconHint |
								:hintPos = preIconHintPos
							.

					- block input
						< _.&__cell.&__input-cont
							< input.&__input &
								ref = input |
								:id = id |
								:name = name |
								:form = form |
								:type = type |
								:placeholder = placeholder && t(placeholder) |
								:pattern = pattern |
								:autocomplete = autocomplete |
								:autofocus = autofocus |
								:maxlength = maxlength |
								:readonly = autocomplete === 'off' ? 'readonly' : undefined |
								@focus = onFocus |
								@input = onEdit |
								@blur = onBlur |
								${attrs|!html}
							.

					- block icon
						< _.&__cell.&__icon.&__post-icon v-if = icon
							< component &
								:instanceOf = icon |
								:is = iconComponent |
								:value = icon |
								:hint = iconHint |
								:hintPos = iconHintPos
							.

					- block clear
						< _.&__cell.&__icon.&__clear v-if = resetButton
							< span v-e:mousedown.prevent | @click = onClear
								< b-icon &
									:value = 'clear' |
									:hint = l('Clear')
								.

					- block validation
						< _.&__cell.&__icon.&__valid-status v-if = mods.valid != null
							< b-icon :value = {true: 'done', false: 'clear'}[mods.valid]

					- block progress
						< _.&__cell.&__icon.&__progress
							< b-progress-icon v-once

					- block icons
