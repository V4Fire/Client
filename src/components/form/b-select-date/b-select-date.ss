- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'components/super/i-input'|b as placeholder

- template index() extends ['i-input'].index
	- rootTag = 'span'

	- block body
		- super

		- block input
			+= self.hiddenInput()

		- block wrapper
			< .&__wrapper
				< .&__cell
					- block month
						< b-select &
							ref = month |
							:value = value.getMonth() |
							:items = months |
							:native = native |
							:mods = provide.mods({width: 'full'}) |
							@change = onValueUpdate |
							@actionChange = onActionChange
						.

				< .&__cell
					- block day
						< b-select &
							ref = day |
							:value = value.getDate() |
							:items = days |
							:native = native |
							:mods = provide.mods({width: 'full'}) |
							@change = onValueUpdate |
							@actionChange = onActionChange
						.

				< .&__cell
					- block year
						< b-select &
							ref = year |
							:value = value.getFullYear() |
							:items = years |
							:native = native |
							:mods = provide.mods({width: 'full'}) |
							@change = onValueUpdate |
							@actionChange = onActionChange
						.
