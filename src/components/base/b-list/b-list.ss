- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'components/super/i-data'|b as placeholder

- template index() extends ['i-data'].index
	- block headHelpers
		- super

		/**
		 * Generates a list block
		 * @param {Array<Item>} items - the items to render
		 */
		- block list(items)
			< template v-for = (el, i) in ${items}
				< .&__item v-tag = listElementTag
					< .&__link &
						v-tag = getHref(el) !== undefined ? 'a' : 'button' |
						ref = items |
						:key = getItemKey(el, i) |

						:href = getHref(el) |
						:value = el.value |
						:aria-selected = getHref(el) === undefined ? isActive(el.value) : undefined |

						:-id = values.getIndex(el.value) |
						:-hint = el.hint |

						:class = el.classes.concat(provide.elementClasses({
							link: {
								id: values.getIndex(el.value),
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
							< span.&__cell.&__link-icon.&__link-pre-icon v-if = el.preIcon || $slots['preIcon']
								+= self.slot('preIcon', {':item': 'el', ':icon': 'el.preIcon'})
									< component &
										v-if = el.preIconComponent |
										:is = el.preIconComponent |
										:value = el.preIcon
									.

									< .g-icon v-else | v-icon:[el.preIcon]

						- block value
							< span.&__cell.&__link-value
								+= self.slot('default', {':item': 'el'})
									< template v-if = item
										< component &
											:is = Object.isFunction(item) ? item(el, i) : item |
											v-attrs = getItemProps(el, i)
										.

									< template v-else
										{{ el.label }}

						- block icon
							< span.&__cell.&__link-icon.&__link-post-icon v-if = el.icon || $slots['icon']
								+= self.slot('icon', {':item': 'el', ':icon': 'el.icon'})
									< component &
										v-if = el.iconComponent |
										:is = el.iconComponent |
										:value = el.icon
									.

									< .g-icon v-else | v-icon:[el.icon]

						- block progress
							< span.&__cell.&__link-icon.&__link-progress v-if = el.progressIcon != null || $slots['progressIcon']
								+= self.slot('progressIcon', {':item': 'el', ':icon': 'el.progressIcon'})
									< component &
										v-if = Object.isString(el.progressIcon) |
										:is = el.progressIcon
									.

									< b-progress-icon v-else

	- block body
		- super

		< .&__wrapper v-tag = listTag | v-attrs = attrs
			+= self.list('items')
