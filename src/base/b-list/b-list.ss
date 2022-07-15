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
	/** @deprecated */
	- listTag = 'ul'

	/** @deprecated */
	- listElTag = 'li'

	- block headHelpers
		- super

		/**
		 * Generates a list block
		 * @param {!Array<Item>} items - items to render
		 */
		- block list(items)
			< template v-for = (el, i) in ${items} | :key = getItemKey(el, i)
				< tag.&__item :is = listElTag
					< tag &
						:is = el.href !== undefined ? 'a' : 'button' |

						:href = el.href |
						:value = el.value |
						:aria-selected = el.href === undefined ? isActive(el.value) : undefined |

						:-id = values.get(el.value) |
						:-hint = el.hint |

						:class = el.classes.concat(provide.elementClasses({
							link: {
								id: values.get(el.value),
								active: isActive(el.value),
								exterior: el.exterior,
								hidden: el.hidden,
								progress: el.progress,
								...el.mods
							}
						})) |

						v-attrs = el.attrs
					.
						- block preIcon
							< span.&__cell.&__link-icon.&__link-pre-icon v-if = el.preIcon || vdom.getSlot('preIcon')
								+= self.slot('preIcon', {':item': 'el', ':icon': 'el.preIcon'})
									< component &
										v-if = el.preIconComponent |
										:instanceOf = bIcon |
										:is = el.preIconComponent |
										:value = el.preIcon
									.

									< @b-icon v-else | :value = el.preIcon

						- block value
							< span.&__cell.&__link-value
								+= self.slot('default', {':item': 'el'})
									< template v-if = item
										< component &
											:is = Object.isFunction(item) ? item(el, i) : item |
											v-attrs = getItemProps(el, i)
										.

									< template v-else
										{{ t(el.label) }}

						- block icon
							< span.&__cell.&__link-icon.&__link-post-icon v-if = el.icon || vdom.getSlot('icon')
								+= self.slot('icon', {':item': 'el', ':icon': 'el.icon'})
									< component &
										v-if = el.iconComponent |
										:instanceOf = bIcon |
										:is = el.iconComponent |
										:value = el.icon
									.

									< @b-icon v-else | :value = el.icon

						- block progress
							< span.&__cell.&__link-icon.&__link-progress v-if = el.progressIcon != null || vdom.getSlot('progressIcon')
								+= self.slot('progressIcon', {':item': 'el', ':icon': 'el.progressIcon'})
									< component &
										v-if = Object.isString(el.progressIcon) |
										:is = el.progressIcon
									.

									< @b-progress-icon v-else

	- block body
		- super

		< tag.&__wrapper &
			:is = listTag |
			v-attrs = attrs
		.
			+= self.list('items')
