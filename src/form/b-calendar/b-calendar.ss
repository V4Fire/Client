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
	- rootWrapper = true

	- block attrs
		? Object.assign(attrs, {'@click': 'toggle'})

	- block body
		- super

		- block input
			+= self.hiddenInput()

		- block label
			< _ &
				@click.prevent = focus(), toggle() |
				:class = provide.elClasses({'label-nav': {buttons: !hasDayRange}})
			.
				- block labelPrev
					< button:a.&__cell.&__icon.&__prev &
						@click.capture.stop = onSwitchDay(-1) |
						v-if = !hasDayRange
					.

						< @b-icon :value = 'keyboard_arrow_left'

				- block labelValue
					< .&__cell.&__value
						< .&__calendar-icon
							< @b-icon :value = 'calendar'

						{{ labelText }}

				- block labelNext
					< button:a.&__cell.&__icon.&__next &
						@click.capture.stop = onSwitchDay(1) |
						v-if = !hasDayRange
					.
						< @b-icon :value = 'keyboard_arrow_right'

		- block dropdown
			< .&__dropdown &
				v-if = opt.ifOnce('opened', m.opened !== 'false') && delete watchModsStore.opened |
				:class = provide.elClasses({dropdown: {pos: position, 'immediately-shown': shown}})
			.
				< .&__dropdown-content ref = dropdown
					- block nav
						< .&__nav
							- block dropdownControls
								< . :class = provide.elClasses({'label-year': {once: value.length === 1}})
									{{ pointer[0].getFullYear() }}

								< .&__dropdown-controls
									- block navPrev
										< .&__cell.&__icon.&__prev @click = onSwitchMonth(-1)
											< @b-icon :value = 'keyboard_arrow_left'

									- block navValue
										< .&__cell.&__value
											{{ dropdownTitle }}

									- block navNext
										< .&__cell.&__icon.&__next @click = onSwitchMonth(1)
											< @b-icon :value = 'keyboard_arrow_right'

								< .&__label-year
									< template v-if = value.length > 1
										{{ pointer[1].getFullYear() }}

					- block items
						< .&__items-container
							< .&__item v-for = (_, i) in value.length ? value : [null]
								- block th
									< .&__row
										< .&__td.&__h v-for = el in Date.getWeekDays()
											{{ el }}

								< .&__hr

								- block days
									< transition &
										:enter-active-class = animateMonthEnterClass |
										:duration = {enter: 200, leave: 0} |
										@afterLeave = onMonthSwitchEnd
									.
										< .&__month-wrap v-if = !monthSwitchAnimation
											< .&__row v-for = days in getMonthDays(i)
												< .&__td &
													v-for = day in days |
													:class = provide.elClasses({
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
														:class = provide.elClasses({day: {active: day.active, disabled: day.disabled}}) |
														:disabled = day.disabled |
														:-calendar = i
													.
														{{ day.text }}

													< .&__day v-if = !day.text
														{{ day.text }}

					- block time
						< template v-if = hasTimeRange && value.length === 2
							< .&__hr
							< .&__time-block

								< .&__time-label
									{{ `From` }}

								< b-input-time &
									:pointer = value[0] |
									:max = 'now' |
									:-index = 0 |
									@actionChange = onTimeChange
								.

								< .&__time-label
									{{ `To` }}

								< b-input-time &
									:pointer = value[1] |
									:-index = 1 |
									@actionChange = onTimeChange
								.
