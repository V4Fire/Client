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
	- rootTag = 'span'
	- rootWrapper = true
	- skeletonMarker = true

	- block body
		- super

		< .&__button &
			ref = button |

			:class = provide.hintClasses(hintPos) |
			:autofocus = autofocus |
			:tabindex = tabIndex |
			:-hint = hint |

			@click = onClick |
			@focus = focus |
			@blur = blur |

			v-attrs = attrs |
			v-tag = type === 'link' ? 'a' : 'button' |

			${attrs|!html}
		.

			< _.&__wrapper
				- block preIcon
					< _.&__cell.&__icon.&__pre-icon v-if = preIcon || $slots['preIcon']
						+= self.slot('preIcon', {':icon': 'preIcon'})
							< component &
								v-if = preIconComponent |
								:is = preIconComponent |
								:value = preIcon
							.

							< .g-icon v-else | v-icon:[preIcon]

				- block value
					< _.&__cell.&__value
						+= self.slot()

				- block expand
					< _.&__cell.&__icon.&__expand v-if = $slots['dropdown']

				- block icon
					< _.&__cell.&__icon.&__post-icon v-if = icon || $slots['icon']
						+= self.slot('icon', {':icon': 'icon'})
							< component &
								v-if = iconComponent |
								:is = iconComponent |
								:value = icon
							.

							< .g-icon v-else | v-icon:[icon]

				- block progress
					< _.&__cell.&__icon.&__progress v-if = progressIcon != null || $slots['progressIcon']
						+= self.slot('progressIcon', {':icon': 'progressIcon'})
							< component &
								v-if = Object.isString(progressIcon) |
								:is = progressIcon
							.

							< b-progress-icon v-else

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
				ref = dropdown |
				v-if = hasDropdown |
				:id = dom.getId('dropdown') |
				:class = provide.elementClasses({dropdown: {pos: dropdown}})
			.
				< .&__dropdown-content
					+= self.slot('dropdown')
