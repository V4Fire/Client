- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'form/b-checkbox'|b as placeholder

- template index() extends ['b-checkbox'].index
	- block checkbox
		- block label
			< .&__cell.&__label
				{{ label }}

		- block icon
			< .&__cell.&__icon v-if = vnode.getSlot('icon')
				+= self.slot('icon')

			< .&__cell.&__icon v-else
				< component &
					:instanceOf = bIcon |
					:is = p.iconComponent || icon |
					:value = p.icon || name
				.
