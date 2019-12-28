/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- namespace [%fileName%]

- include 'super/i-block'|b as placeholder

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
							< .&__page -page = index
								+= self.slot('default', {':history': 'history'})

							- block back
								< .&__back @click = back

							- block subPages
								< .&__sub-pages v-if = vdom.getSlot('pages')
									+= self.slot('pages', {':history': 'history'})
