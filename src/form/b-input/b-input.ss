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
	- rootWrapper = true

	- block body
		- super
		< _.&__super-wrapper ref = superWrapper | @click = focus
			- block wrapper
				< _.&__wrapper
					- block preIcon
						< _.&__cell.&__icon.&__pre-icon v-if = vdom.getSlot('preIcon')
							+= self.slot('preIcon', { &
								':icon': 'preIcon',
								':hint': 'preIconHint',
								':hintPos': 'preIconHintPos'
							}) .

						< _.&__cell.&__icon.&__pre-icon v-else-if = preIcon
							< component &
								v-if = preIconComponent |
								:instanceOf = bIcon |
								:is = preIconComponent |
								:value = preIcon |
								:hint = preIconHint |
								:hintPos = preIconHintPos
							.

							< @b-icon &
								v-else |
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
								:autocomplete = autocomplete |
								:autofocus = autofocus |
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
						< _.&__cell.&__icon.&__post-icon v-if = vdom.getSlot('icon')
							+= self.slot('icon', { &
								':icon': 'icon',
								':hint': 'iconHint',
								':hintPos': 'iconHintPos'
							}) .

						< _.&__cell.&__icon.&__post-icon v-else-if = icon
							< component &
								v-if = iconComponent |
								:instanceOf = bIcon |
								:is = iconComponent |
								:value = icon |
								:hint = iconHint |
								:hintPos = iconHintPos
							.

							< @b-icon &
								v-else |
								:value = icon |
								:hint = iconHint |
								:hintPos = iconHintPos
							.

					- block clear
						< _.&__cell.&__icon.&__clear v-if = clearIcon || vdom.getSlot('clearIcon')
							< span v-e:mousedown.prevent | @click = onClear
								< template v-if = vdom.getSlot('clearIcon')
									+= self.slot('icon', { &
										':icon': 'clearIcon',
										':hint': 'clearIconHint',
										':hintPos': 'clearIconHintPos'
									}) .

								< component &
									v-else-if = iconComponent |
									:instanceOf = bIcon |
									:is = iconComponent |
									:value = clearIcon |
									:hint = clearIconHint |
									:hintPos = clearIconHintPos
								.

								< @b-icon &
									v-else |
									:value = clearIcon |
									:hint = clearIconHint |
									:hintPos = clearIconHintPos
								.

					- block validation
						< _.&__cell.&__icon.&__valid-status v-if = m.valid != null
							< @b-icon :value = {true: 'done', false: 'clear'}[m.valid]

					- block progress
						< _.&__cell.&__icon.&__progress
							< @b-progress-icon

					- block icons
