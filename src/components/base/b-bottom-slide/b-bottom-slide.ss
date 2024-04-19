/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- namespace [%fileName%]

- include 'components/super/i-block'|b as placeholder
- include 'components/traits/i-history'|b

- template index() extends ['i-block'].index
	- teleport = @@teleport

	- block headHelpers
		< .&__overlay &
			v-if = overlay |
			ref = overlay |
			@click = close
		.

	- block body
		< .&__window &
			ref = window |
			v-if =
				forceInnerRender ||
				opt.ifOnce('opened', m.opened === 'true') && delete reactiveModsStore.opened
		.
			- block header
				< header.&__header &
					ref = header |
					@touchstart = swipeControl.onPullStart($event, true) |
					@touchmove = swipeControl.onPull |
					@touchend = swipeControl.onPullEnd
				.
					< .&__toggler-stripe
						< .&__toggler

			- block view
				< .&__view &
					ref = view |
					v-on-resize = {handler: recalculateState} |
					@touchstart = swipeControl.onPullStart |
					@touchmove = swipeControl.onPull |
					@touchend = swipeControl.onPullEnd
				.
					- block content
						< .&__content ref = content
							+= self.getTpl('i-history/')({self})
