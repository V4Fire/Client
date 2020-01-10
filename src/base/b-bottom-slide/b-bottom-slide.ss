/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- namespace [%fileName%]

- include 'super/i-block'|b as placeholder
- include 'traits/i-history'|b

- template index() extends ['i-block'].index
	- block headHelpers
		< .&__overlay &
			v-if = overlay |
			ref = overlay |
			@click = close
		.

	- block body
		< .&__window ref = window
			- block header
				< header.&__header &
					ref = header |
					@touchstart = (e) => onStart(e, true) |
					@touchmove = onMove |
					@touchend = onRelease
				.
					< .&__toggler-stripe
						< .&__toggler

			- block view
				< .&__view &
					ref = view |
					@touchstart = onStart |
					@touchmove = onMove |
					@touchend = onRelease
				.
					< .&__trigger v-in-view = inViewParams

					- block content
						< .&__content ref = content
							+= self.getTpl('i-history/')({self})
