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

	- block headHelpers
		- super

		/**
		 * Generates component items
		 * @param {string} [tag] - tag to generate item
		 */
		- block items(tag = '_')
			< template v-for = (el, i) in items
				: itemAttrs = {}

				- if tag === 'option'
					? itemAttrs[':selected'] = 'isSelected(el.value)'

				- else
					? itemAttrs.role = 'option'
					? itemAttrs[':aria-selected'] = 'isSelected(el.value)'

				< ${tag}.&__item &
					:key = getItemKey(el, i) |
					:-id = values.getIndex(el.value) |

					:class = Array.toArray(el.classes, provide.elementClasses({
						item: {
							id: values.getIndex(el.value),
							selected: isSelected(el.value),
							exterior: el.exterior,
							...el.mods
						}
					})) |

					v-attrs = el.attrs |
					${itemAttrs}
				.
					+= self.slot('default', {':item': 'el'})
						< template v-if = item
							< component &
								:is = Object.isFunction(item) ? item(el, i) : item |
								v-attrs = getItemProps(el, i)
							.

						< template v-else
							{{ el.label }}

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
						< template v-if = native
							+= self.nativeInput({tag: 'select', model: 'undefined', attrs: {'@change': 'onNativeChange'}})
								+= self.items('option')

						< template v-else
							+= self.nativeInput({model: 'textStore', attrs: {'@input': 'onSearchInput'}})

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

				- block expand
					< _.&__cell.&__icon.&__expand @click = open

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

	- block bodyFooter
		- super

		- block dropdown
			< _.&__dropdown[.&_pos_bottom-left] &
				ref = dropdown |
				v-if = !native && items.length && (
					isFunctional ||
					opt.ifOnce('opened', m.opened !== 'false') && delete reactiveModsStore.opened
				)
			.
				+= self.items()
