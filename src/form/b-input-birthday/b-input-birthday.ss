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
	- rootTag = 'span'

	- block body
		- super

		- block input
			+= self.hiddenInput()

		- block wrapper
			< .&__wrapper
				< .&__cell
					< b-select &
						ref = month |
						:selected = value.getMonth() |
						:options = months |
						:resetButton = false |
						:mods = provide.mods({width: 'full'}) |
						@change = onValueUpdate |
						@actionChange = onActionChange
					.

				< .&__cell
					< b-select &
						ref = day |
						:selected = value.getDate() |
						:options = days |
						:resetButton = false |
						:mods = provide.mods({width: 'full'}) |
						@change = onValueUpdate |
						@actionChange = onActionChange
					.

				< .&__cell
					< b-select &
						ref = year |
						:selected = value.getFullYear() |
						:options = years |
						:resetButton = false |
						:mods = provide.mods({width: 'full'}) |
						@change = onValueUpdate |
						@actionChange = onActionChange
					.
