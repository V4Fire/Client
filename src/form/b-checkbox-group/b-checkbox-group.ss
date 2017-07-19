- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'super/i-input'|b as placeholder

- template index() extends ['i-input'].index
	- block body
		- super

		- block input
			+= self.hiddenInput()

		- block list
			< .&__list
				< .&__el v-for = el in options | :key = el.id || el.name
					- block checkbox
						: defAttrs = { &
							':id': 'getConnectedId(el.id)',
							':name': 'el.name',
							':label': 'el.label',
							':form': 'form',
							':autofocus': 'el.autofocus',
							':value': 'isChecked(el)',
							':changeable': 'isChangeable(el)',
							':mods': 'provideMods({form: false})'
						} .

						< template v-if = $scopedSlots.default
							< slot &
								:el = el |
								:onChange = onChange |
								:onActionChange = onActionChange |
								${defAttrs|!html} |
								${slotAttrs|!html}
							.

						< template v-else
							< component.&__checkbox &
								:instanceOf = bCheckbox |
								:is = option |
								:p = el |
								@change = onChange |
								@actionChange = onActionChange |
								${defAttrs|!html}
							.
