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
	- rootWrapper = true

	- block headHelpers
		- super

		/**
		 * Generates component items
		 * @param {string=} [tag] - tag to generate item
		 */
		- block items(tag = '_')
			< template v-for = (el, i) in items | :key = getItemKey(el, i)
				: itemAttrs = {}

				- if tag === 'option'
					? itemAttrs[':selected'] = 'isSelected(el.value)'

				< ${tag} &
					:-id = values.get(el.value) |

					:class = Array.concat([], el.classes, provide.elClasses({
						item: {
							id: values.get(el.value),
							selected: isSelected(el.value),
							exterior: el.exterior,
							...el.mods
						}
					})) |

					:v-attrs = native ?
						el.attrs :
						{
							'v-aria:option': getAriaConfig('option', el),
							...el.attrs
						} |

					v-id.preserve = el.value |

					${itemAttrs}
				.
					+= self.slot('default', {':item': 'el'})
						< template v-if = item
							< component &
								:is = Object.isFunction(item) ? item(el, i) : item |
								:v-attrs = getItemProps(el, i)
							.

						< template v-else
							{{ t(el.label) }}

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
					< template v-if = native
						< _.&__cell.&__input-wrapper
							+= self.nativeInput({tag: 'select', model: 'undefined', attrs: {'@change': 'onNativeChange'}})
								+= self.items('option')

					< template v-else
						< _.&__cell.&__input-wrapper v-aria:combobox = getAriaConfig('combobox')
							+= self.nativeInput({model: 'textStore', attrs: {'@input': 'onSearchInput'}})

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

				- block expand
					< _.&__cell.&__icon.&__expand @click = open

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
				ref = dropdown |
				v-if = !native && items.length && (
					isFunctional ||
					opt.ifOnce('opened', m.opened !== 'false') && delete watchModsStore.opened
				) |
				v-aria:listbox
			.
				+= self.items()
