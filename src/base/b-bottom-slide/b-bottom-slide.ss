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
			< header.&__header &
				ref = header |
				@touchstart = (e) => onStart(e, true) |
				@touchmove = onMove |
				@touchend = onRelease
			.
				< .&__toggler-stripe
					< .&__toggler

				< .&__title v-if = vdom.getSlot('title')
					< template v-if = vdom.getSlot('backIcon')
						< .&__back v-if = history.length | @click = back
							+= self.slot('backIcon')

					< .&__title-content @click = onTitleClick
						+= self.slot('title')

			< .&__view &
				ref = view |
				@touchstart = onStart |
				@touchmove = onMove |
				@touchend = onRelease
			.
				< .&__trigger v-if = hasInView | v-in-view = inViewParams
				< .&__content ref = content
					+= self.slot('default', {':history': 'history'})

					< .&__sub-pages v-if = vdom.getSlot('pages')
						+= self.slot('pages', {':history': 'history'})
