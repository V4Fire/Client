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
	- skeletonMarker = true

	- hiddenInputTag = 'input'
	- hiddenInputType = "'hidden'"
	- hiddenInputModel = 'valueStore'

	- block headHelpers
		- super

		/**
		 * Generates a private input field
		 */
		- block hiddenInput()
			< ${hiddenInputTag}.&__hidden-input &
				ref = input |
				v-model = ${hiddenInputModel} |
				autocomplete = off |
				:id = id |
				:type = ${hiddenInputType} |
				:name = name |
				:form = form |
				:autofocus = autofocus |
				@focus = onFocus |
				@blur = onBlur |
				${attrs|!html}
			.

	- block helpers
		- super
		- block message
			< template v-if = messageHelpers
				- forEach ['error', 'info'] => el
					< _.&__message-box[.&_pos_right-top].&__${el}-box
						< _.&__message-content
