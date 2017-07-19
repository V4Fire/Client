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
		? Object.assign(attrs, {'@click': 'toggle'})

	- block body
		- super

		- block input
			+= self.hiddenInput()

		- block label
			< _ &
				@click.prevent = focus(), toggle() |
				:class = getElClasses({'label-nav': {buttons: !dayRange}})
			.
				- block labelPrev
					< button:a.&__cell.&__icon.&__prev &
						@click.capture.stop = onSwitchDay(-1) |
						v-if = mods.theme === 'default' && !dayRange
					.
						< b-icon :value = 'keyboard_arrow_left'

				- block labelValue
					< .&__cell.&__value
						< .&__calendar-icon
							< b-icon :value = 'calendar' | :mods = provideMods({size: 'xl'})
						{{ labelText.capitalize() }}

				- block labelNext
					< button:a.&__cell.&__icon.&__next &
						@click.capture.stop = onSwitchDay(1) |
						v-if = mods.theme === 'default' && !dayRange
					.
						< b-icon :value = 'keyboard_arrow_right'

		- block dropdown
			< .&__dropdown &
				v-if = ifOnce('opened', mods.opened !== 'false') |
				:class = getElClasses({dropdown: {pos: position, 'immediately-shown': isShown}})
			.
				< .&__dropdown-content ref = dropdown
					- block nav
						< .&__nav
							- block dropdownControls
								< . :class = getElClasses({'label-year': {once: value.length === 1}})
									{{ pointer[0].getFullYear() }}

								< .&__dropdown-controls
									- block navPrev
										< .&__cell.&__icon.&__prev @click = onSwitchMonth(-1)
											< b-icon :value = 'keyboard_arrow_left'

									- block navValue
										< .&__cell.&__value
											{{ dropdownTitle }}

									- block navNext
										< .&__cell.&__icon.&__next @click = onSwitchMonth(1)
											< b-icon :value = 'keyboard_arrow_right'

								< .&__label-year
									< template v-if = value.length > 1
										{{ pointer[1].getFullYear() }}

					- block items
						< .&__items-container
							< .&__item v-for = (el, index) in value
								- block th
									< .&__row
										< .&__td.&__h v-for = el in [t('Mn'), t('Ts'), t('Wd'), t('Th'), t('Fr'), t('St'), t('Sn')]
											{{ el }}

								< .&__hr
								- block days
									< transition &
										:enter-active-class = animateMonthEnterClass |
										:duration = {enter: 200, leave: 0} |
										v-on:after-leave = onMonthSwitchEnd
									.
										< .&__month-wrap v-if = !isMonthSwitchAnimation
											< .&__row v-for = days in dayInMonth(index)
												< .&__td &
													v-for = day in days |
													:class = getElClasses({
														cell: {
															touch: !!day.text.length,
															'in-range': day.inRange,
															'range-start': day.rangeStart,
															'range-end': day.rangeEnd
														}
													})
												.

													< button:a &
														v-if = day.text |
														:class = getElClasses({day: {active: day.active, disabled: day.disabled}}) |
														:disabled = day.disabled |
														:-calendar = index
													.
														{{ day.text }}

													< .&__day v-if = !day.text
														{{ day.text }}

					- block time
						< template v-if = timeRange && value.length === 2
							< .&__hr
							< .&__time-block

								< .&__time-label
									{{ `From` }}

								< b-input-time &
									:pointer = value[0] |
									:max = 'now' |
									:mods = {theme: 'light'} |
									:-index = 0 |
									@actionChange = onTimeChange
								.

								< .&__time-label
									{{ `To` }}

								< b-input-time &
									:pointer = value[1] |
									:-index = 1 |
									:mods = {theme: 'light'} |
									@actionChange = onTimeChange
								.
