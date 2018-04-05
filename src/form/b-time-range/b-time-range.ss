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
	- block attrs
		- super
		? Object.assign(attrs, {'@click': 'toggle'})

	- block body
		- super
		- block label
			+= self.hiddenInput()
			< .&__value @click = focus(), toggle()
				- block preIcon
					< .&__cell.&__icon.&__pre-icon
						< b-icon :value = 'timelapse'

				< .&__cell.&__time v-if = m.empty !== 'true'
					- block input
						< span v-if = getField('value.from.length')
							{{ `From` }}

							< time.&__from
								{{ h.getTimeFormattedValue(value.from) }}

						< span v-if = getField('value.to.length')
							{{ `To` }}

							< time.&__to
								{{ h.getTimeFormattedValue(value.to) }}

				< .&__cell.&__empty v-else
					- block empty
						{{ `Set the time` }}

				- block clear
					< button:a.&__cell.&__icon.&__clear &
						v-if = m.empty !== 'true' |
						@click.capture.stop = onClear
					.
						< b-icon &
							:value = 'clear' |
							:hint = l('Clear')
						.

		- block dropdown
			< .&__dropdown[.&_pos_bottom] v-if = m.opened !== 'false'
				< .&__dropdown-content
					< .&__form
						- block table
							< table
								< tr
									< td.&__label
										{{ `From` }}

									< td.&__input
										< b-input-number.&__input-from &
											:value = getField('value.from.0') |
											:max = 24 |
											:min = 0 |
											:placeholder = '__' |
											:mods = provideMods({theme: 'light', form: false})
										.

									< td.&__sep
										{{ `:` }}

									< td.&__input
										< b-input-number.&__input-from &
											:value = getField('value.from.1') |
											:max = 59 |
											:min = 0 |
											:placeholder = '__' |
											:controllersPos = 'right' |
											:mods = provideMods({theme: 'light', form: false})
										.

								< tr
									< td.&__label
										{{ `To` }}

									< td.&__input
										< b-input-number.&__input-to &
											:value = getField('value.to.0') |
											:max = 24 |
											:min = 0 |
											:placeholder = '__' |
											:mods = provideMods({theme: 'light', form: false})
										.

									< td.&__sep
										{{ `:` }}

									< td.&__input
										< b-input-number.&__input-to &
											:value = getField('value.to.1') |
											:max = 59 |
											:min = 0 |
											:placeholder = '__' |
											:controllersPos = 'right' |
											:mods = provideMods({theme: 'light', form: false})
										.

						- block controls
							< .&__controls
								< b-button.&__button &
									:mods = provideMods({theme: 'light', rounding: 'none'}) |
									@click = onSave
								.
									{{ `Select` }}

								< b-button.&__button &
									:mods = provideMods({theme: 'dark', rounding: 'none'}) |
									@click = close
								.
									{{ `Close` }}
