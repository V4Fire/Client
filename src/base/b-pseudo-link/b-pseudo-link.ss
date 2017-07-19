- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'base/b-link'|b as placeholder

- template index() extends ['b-link'].index
	- block link
		< a:void.&__cell.&__link &
			ref = link |
			:class = setHint(hintPos) |
			:-hint = t(hint) |
			${attrs|!html}
		.
			< slot
