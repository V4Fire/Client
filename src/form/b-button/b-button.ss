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
	- rootWrapper = true
	- skeletonMarker = true

	- block body
		- super

		< tag.&__button &
			ref = button |

			:is = type === 'link' ? 'a' : 'button' |
			:class = provide.hintClasses(hintPos) |
			:autofocus = autofocus |
			:tabindex = tabIndex |
			:-hint = t(hint) |

			@click = onClick |
			@focus = focus |
			@blur = blur |

			:v-attrs = type === 'link' ? {href} : {type, form} |
			${attrs|!html}
		.

			< _.&__wrapper
				- block preIcon
					< _.&__cell.&__icon.&__pre-icon v-if = preIcon || vdom.getSlot('preIcon')
						+= self.slot('preIcon', {':icon': 'preIcon'})
							< component &
								v-if = preIconComponent |
								:instanceOf = bIcon |
								:is = preIconComponent |
								:value = preIcon
							.

							< @b-icon v-else | :value = preIcon

				- block value
					< _.&__cell.&__value
						+= self.slot()

				- block expand
					< _.&__cell.&__icon.&__expand v-if = vdom.getSlot('dropdown')

				- block icons
					< _.&__cell.&__icon.&__post-icon v-if = icon || vdom.getSlot('icon')
						+= self.slot('icon', {':icon': 'icon'})
							< component &
								v-if = iconComponent |
								:instanceOf = bIcon |
								:is = iconComponent |
								:value = icon
							.

							< @b-icon v-else | :value = icon

				- block progress
					< _.&__cell.&__icon.&__progress v-if = progressIcon != null || vdom.getSlot('progressIcon')
						+= self.slot('progressIcon', {':icon': 'progressIcon'})
							< component &
								v-if = Object.isString(progressIcon) |
								:is = progressIcon
							.

							< @b-progress-icon v-else

		< template v-if = type === 'file'
			< input.&__file &
				ref = file |
				type = file |
				:accept = accept |
				:form = form |
				@change = onFileChange
			.

		- block dropdown
			< . &
				v-if = vdom.getSlot('dropdown') && (
					isFunctional ||
					opt.ifOnce('opened', m.opened !== 'false') && delete watchModsStore.opened
				) |

				:class = provide.elClasses({dropdown: {pos: dropdown}})
			.
				< .&__dropdown-content
					+= self.slot('dropdown')
