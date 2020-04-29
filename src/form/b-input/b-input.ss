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
						< _.&__cell.&__icon.&__pre-icon v-if = $slots.preIcon
							+= self.slot('preIcon')

						< _.&__cell.&__icon.&__pre-icon v-else-if = preIcon
							< component.&__b-icon &
								v-if = preIconComponent || preIconHint |
								:instanceOf = bIcon |
								:is = preIconComponent |
								:value = preIcon |
								:hint = preIconHint |
								:hintPos = preIconHintPos
							.

							< template v-else
								+= self.gIcon(['preIcon'], {'g-icon': {}})

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
								:tabindex = tabIndex |
								:maxlength = maxlength |
								:min = min |
								:max = max |
								:readonly = readonly || autocomplete === 'off' ? 'readonly' : undefined |
								@focus = onFocus |
								@input = onEdit |
								@blur = onBlur |
								${attrs|!html}
							.

					- block icon
						< _.&__cell.&__icon.&__post-icon v-if = $slots.icon
							+= self.slot('icon')

						< _.&__cell.&__icon.&__post-icon v-else-if = icon
							< component.&__b-icon &
								v-if = iconComponent || iconHint |
								:instanceOf = bIcon |
								:is = iconComponent |
								:value = icon |
								:hint = iconHint |
								:hintPos = iconHintPos
							.

							< template v-else
								+= self.gIcon(['icon'], {'g-icon': {}})

					- block clear
						< _.&__cell.&__icon.&__clear v-if = resetButton && !readonly
							< span v-e:mousedown.prevent | @click = onClear
								< b-icon &
									:value = 'clear' |
									:hint = l('Clear')
								.

					- block validation
						< _.&__cell.&__icon.&__valid-status v-if = m.valid != null
							+= self.gIcon(["{true: 'done', false: 'clear'}[m.valid]"])

					- block progress
						< _.&__cell.&__icon.&__progress v-if = dataProvider
							< b-progress-icon v-once

					- block icons
