- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'super/i-block'|b as placeholder

- template index() extends ['i-block'].index
	- block body
		- super

		- block damaged
			< .&__damaged
				< b-icon :value = brokenIcon

		- block overlay
			< .&__overlay

		- block image
			< .&__img
				< img &
					v-show = m.loading === 'false' |
					ref = img |
					:src = load && src
				.
