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
	- messageHelpers = true

	- block body
		- super
		- block button(type = 'button')
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

			< ${type}.&__button &
				ref = button |
				:class = setHint(hintPos) |
				:autofocus = autofocus |
				:-hint = t(hint) |
				@click = onClick |
				${buttonAttrs} |
				${attrs|!html}
			.

				< _.&__wrapper
					- block preIcon
						< _.&__cell.&__icon.&__pre-icon v-if = preIcon
							< component.&__b-icon &
								v-if = preIconComponent |
								:instanceOf = bIcon |
								:is = preIconComponent |
								:value = preIcon
							.

							< template v-else
								+= self.gIcon(['preIcon'], {'g-icon': {}})

					- block value
						< _.&__cell.&__value
							+= self.slot()

					- block expand
						< _.&__cell.&__icon.&__expand v-if = $slots.dropdown
							+= self.gIcon('expand_more')

					- block icon
						< _.&__cell.&__icon.&__post-icon v-if = icon
							< component.&__b-icon &
								v-if = iconComponent |
								:instanceOf = bIcon |
								:is = iconComponent |
								:value = icon
							.

							< template v-else
								+= self.gIcon(['icon'], {'g-icon': {}})

					- block progress
						< _.&__cell.&__icon.&__progress v-if = dataProvider
							< b-progress-icon v-once

		< template v-if = type === 'link'
			+= self.button('a')

		< template v-else
			+= self.button()

		- block dropdown
			< . &
				v-if = $slots.dropdown && (
					isFunctional ||
					ifOnce('opened', m.opened !== 'false') && delete watchModsStore.opened
				) |

				:class = getElClasses({dropdown: {pos: dropdown}})
			.
				< .&__dropdown-content
					+= self.slot('dropdown')
