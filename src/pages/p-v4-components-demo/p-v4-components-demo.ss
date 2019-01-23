- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'super/i-static-page/i-static-page.component.ss'|b as placeholder

- template index() extends ['i-static-page.component'].index
	- block body
		< b-window ref = window
			Hello world!

		< b-button @click = $refs.window.toggle()
			Toggle window

		< b-select :options = [ &
			{
				value: '0',
				label: '0'
			},

			{
				value: '1',
				label: '1'
			},

			{
				value: '2',
				label: '2'
			},

			{
				value: '3',
				label: '3'
			},

			{
				value: '4',
				label: '4'
			},

			{
				value: '5',
				label: '5'
			}
		] .
