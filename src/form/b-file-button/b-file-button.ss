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
	- block button
		- super
		< input.&__file &
			ref = file |
			type = file |
			:accept = accept |
			@change = onFileSelected
		.
