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
		- block button
			< button.&__button &
				ref = button |
				:class = setHint(hintPos) |
				:type = type |
				:form = form |
				:autofocus = autofocus |
				:-hint = t(hint) |
				@click = onClick |
				${attrs|!html}
			.

				< _.&__wrapper
					- block preIcon
						< _.&__cell.&__icon.&__pre-icon v-if = preIcon
							< component &
								:instanceOf = bIcon |
								:is = preIconComponent |
								:value = preIcon
							.

					- block value
						< _.&__cell.&__value
							+= self.slot()

					- block expand
						< _.&__cell.&__icon.&__expand v-if = $slots.dropdown
							< b-icon :value = 'expand_more' | v-once

					- block icon
						< _.&__cell.&__icon.&__post-icon v-if = icon
							< component &
								:instanceOf = icon |
								:is = iconComponent |
								:value = icon
							.

					- block progress
						< _.&__cell.&__icon.&__progress
							< b-progress-icon v-once

		- block dropdown
			< . &
				v-if = $slots.dropdown && ifOnce('opened', mods.opened !== 'false') |
				:class = getElClasses({dropdown: {pos: dropdown}})
			.
				< .&__dropdown-content
					+= self.slot('dropdown')
