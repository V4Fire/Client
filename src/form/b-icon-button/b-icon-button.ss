- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'form/b-button'|b as placeholder

- template index() extends ['b-button'].index
	- block preIcon

	- block value

	- block icon
		< _.&__cell.&__icon v-if = vdom.getSlot('default')
			+= self.slot('default', {':icon': 'icon'})

		< _.&__cell.&__icon
			< component.&__b-icon &
				v-if = iconComponent |
				:instanceOf = bIcon |
				:is = iconComponent |
				:value = icon
			.

			< template v-else
				< @b-icon :value = icon
