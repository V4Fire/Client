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

		< b-window ref = window | :id = 'window' | :title = 'Title' | @keydown = onKeyDown
			Window content

			< div
				< button @click = $refs.window.close() | :id = 'closeBtn'
					Close the window

				< button :id = 'btn1'
					 Do something
				< button :id = 'btn2'
					 Do something#2

		< button @click = $refs.window.open() | :id = 'openBtn'
			Open the window
