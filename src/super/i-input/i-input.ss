- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'super/i-data'|b as placeholder

- template index() extends ['i-data'].index
	- messageHelpers = true
	- skeletonMarker = true

	- hiddenInputTag = 'input'
	- hiddenInputType = 'hidden'

	- block headHelpers
		- super

		/**
		 * Generates a private input field
		 */
		- block hiddenInput()
			< ${hiddenInputTag}.&__hidden-input &
				ref = input |
				v-model = valueStore |
				type = ${hiddenInputType} |
				autocomplete = off |
				:id = id |
				:name = name |
				:form = form |
				:autofocus = autofocus |
				@focus = onFocus |
				@blur = onBlur |
				${attrs|!html}
			.
