- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'super/i-block'|b as placeholder

- template index() extends ['i-block'].index
	- block body
		- super

		- block wrapper
			< .&__wrapper

				- block jumpLeft
					< button:a.&__cell.&__fast-passage &
						v-if = pageCount > 2 |
						:class = getElClasses({state: {disabled: current === 1}}) |
						@click = onFastJump(-1)
					.
						< .&__bias-right
							< b-icon &
								:value = 'keyboard_arrow_left' |
								:mods = provideMods({size: 'xxl'})
							.

						< b-icon &
							:value = 'keyboard_arrow_left' |
							:mods = provideMods({size: 'xxl'})
						.

				- block switchLeft
					< button:a.&__cell.&__step &
						v-if = pageCount > 1 |
						:class = getElClasses({state: {disabled: current === 1}}) |
						@click = onSwitchPage(-1)
					.
						< b-icon &
							:value = 'keyboard_arrow_left' |
							:mods = provideMods({size: 'xxl'})
						.

				- block strip
					< button:a.&__cell.&__page &
						v-for = p in strip |
						:class = getElClasses({state: {active: p === current}})
					.
						< .&__number
							{{ p }}

				- block select
					< .&__self-select v-if = advPages.length > 1
						< b-select &
							:options = advPages |
							:resetButton = false |
							:mods = provideMods({width: 'full', size: 's', theme: 'paging'}) |
							@actionChange = onSelectChange
						.

				- block switchRight
					< button:a.&__cell.&__step &
						v-if = pageCount > 1 |
						:class = getElClasses({state: {disabled: current === pageCount}}) |
						@click = onSwitchPage(1)
					.
						< b-icon &
							:value = 'keyboard_arrow_right' |
							:mods = provideMods({size: 'xxl'})
						.

				- block jumpRight
					< button:a.&__cell.&__fast-passage &
						v-if = pageCount > 2 |
						:class = getElClasses({state: {disabled: current === pageCount}}) |
						@click = onFastJump(1)
					.
						< b-icon &
							:value = 'keyboard_arrow_right' |
							:mods = provideMods({size: 'xxl'})
						.

						< .&__bias-left
							< b-icon &
								:value = 'keyboard_arrow_right' |
								:mods = provideMods({size: 'xxl'})
							.
