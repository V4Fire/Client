- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'components/form/b-button'|b as placeholder

- template index() extends ['b-button'].index
	- block preIcon

	- block value

	- block icon
		< _.&__cell.&__icon v-if = $slots['default']
			+= self.slot('default', {':icon': 'icon'})

		< _.&__cell.&__icon v-else
			< component &
				v-if = iconComponent |
				:is = iconComponent |
				:value = icon
			.

			< .g-icon v-else | v-icon:[icon]
