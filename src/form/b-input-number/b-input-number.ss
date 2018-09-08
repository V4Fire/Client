- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'form/b-input'|b as placeholder

- template index() extends ['b-input'].index
	- block attrs
		- super
		? Object.assign(attrs, { &
			':min': 'min',
			':max': 'max',
			':step': 'step'
		}) .

	- block clear
	- block preIcon
		- super

		/**
		 * Generates range control
		 * @param {string} pos - range position
		 */
		- block range(pos) => 'left'
			< _.&__cell.&__icon.&__range v-if = controllersPos === '${pos}' || controllersPos === 'both'
				< span.&__arrow.&__up v-e:mousedown,touchstart.prevent | @click = onInc(1)
					+= self.gIcon('arrow_drop_up')

				< span.&__arrow.&__up v-e:mousedown,touchstart.prevent | @click = onInc(-1)
					+= self.gIcon('arrow_drop_down')

	- block icons
		+= self.range('right')
