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
		< .&__window &
			ref = window |
			v-if =
				isFunctional ||
				forceInnerRender ||
				opt.ifOnce('opened', m.opened === 'true') && delete watchModsStore.opened
		.
			- block header
				< header.&__header &
					ref = header |
					@touchstart = onPullStart($event, true) |
					@touchmove = onPull |
					@touchend = onPullEnd
				.
					< .&__toggler-stripe
						< .&__toggler

			- block view
				< .&__view &
					ref = view |
					v-resize-observer = {
						callback: recalculateState
					} |
					@touchstart = onPullStart |
					@touchmove = onPull |
					@touchend = onPullEnd
				.
					- block content
						< .&__content ref = content
							+= self.getTpl('i-history/')({self})
