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
	- rootTag = 'span'
	- rootWrapper = true
	- skeletonMarker = true

	- block body
		- super

		/**
		 * Returns an object with button attributes for the specified type
		 *
		 * @param {string=} [type]
		 * @returns {!Object}
		 */
		- block buttonAttrs(type = 'button')
			: buttonAttrs

			- if type === 'a'
				? buttonAttrs = { &
					':href': 'href'
				} .

			- else
				? buttonAttrs = { &
					':form': 'form',
					':type': 'type'
				} .

			- return buttonAttrs

		/**
		 * Generates a button markup for the specified type
		 * @param {string=} [type]
		 */
		- block button(type = 'button')
			< ${type}.&__button &
				ref = button |
				:class = provide.hintClasses(hintPos) |
				:autofocus = autofocus |
				:tabindex = tabIndex |
				:-hint = t(hint) |
				@click = onClick |
				@focus = focus |
				@blur = blur |
				${self.buttonAttrs(type)} |
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

		< template v-if = type === 'link'
			+= self.button('a')

		< template v-else
			+= self.button()

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
