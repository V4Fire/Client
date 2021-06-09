- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'super/i-input-text'|b as placeholder

- template index() extends ['i-input-text'].index
	- rootTag = 'span'
	- rootWrapper = true

	- block body
		- super

		- block wrapper
			< _.&__wrapper @click = focus
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
					< _.&__cell.&__input-wrapper
						+= self.nativeInput({attrs: {model: 'textStore', '@input': 'onEdit'}})

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
					< _.&__cell.&__icon.&__clear @mousedown.prevent | @click = onClear

				- block progress
					< _.&__cell.&__icon.&__progress v-if = progressIcon != null || vdom.getSlot('progressIcon')
						+= self.slot('progressIcon', {':icon': 'progressIcon'})
							< component &
								v-if = Object.isString(progressIcon) |
								:is = progressIcon
							.

							< @b-progress-icon v-else

				- block validation
					< _.&__cell.&__icon.&__valid-status.&__valid
					< _.&__cell.&__icon.&__valid-status.&__invalid

				- block icons

	- block helpers
		- super

		- block dropdown
			< _.&__dropdown[.&_pos_bottom-left] &
				v-if = !browser.is.mobile && items.length && (
					isFunctional ||
					opt.ifOnce('opened', m.opened !== 'false') && delete watchModsStore.opened
				)
			.
				< _.&__dropdown-content
					< _.&__dropdown-content-wrapper
						< _ &
							v-for = (el, i) in items |
							:key = getItemKey(el, i)

							:class = provide.elClasses({
								item: {
									selected: isSelected(el)
								}
							})
						.
							< template v-if = vdom.getSlot('default')
								+= self.slot('default', {':item': 'el'})

							< component &
								v-else-if = item |
								:is = item |
								:p = el |
								:exterior = el.exterior |
								:classes = el.classes |
								:mods = el.mods |
								:v-attrs = el.attrs
							.

							< template v-else
								{{ t(el.label) }}
