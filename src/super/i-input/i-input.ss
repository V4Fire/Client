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

	- nativeInputTag = 'input'
	- nativeInputType = "'hidden'"
	- nativeInputModel = 'valueStore'

	- block headHelpers
		- super

		/**
		 * Generates a native form input
		 *
		 * @param [params] - additional parameters:
		 *   *) [tag=nativeInputTag] - name of the generated tag
		 *   *) [elName='input'] - element name of the generated tag
		 *   *) [ref='input'] - ref attribute
		 *   *) [model=nativeInputModel] - v-model attribute
		 *   *) [type=nativeInputType] - type attribute
		 *   *) [attrs] - dictionary with additional attributes
		 */
		- block nativeInput(@params = {})
			< ${@tag || nativeInputTag}.&__${@elName || 'input'} &
				ref = ${@ref || 'input'} |
				v-model = ${@model || nativeInputModel} |
				:v-attrs = normalizeAttrs(attrs) |
				:id = id |
				:type = normalizeAttrs(attrs).type || ${@type || nativeInputType} |
				:name = name |
				:form = form |
				:autofocus = autofocus |
				:tabIndex = tabIndex |
				@focus = onFocus |
				@blur = onBlur |
				${attrs|!html} |
				${@attrs}
			.

		/**
		 * Generates a hidden form input
		 */
		- block hiddenInput()
			+= self.nativeInput({ &
				elName: 'hidden-input',
				attrs: {
					autocomplete: 'off'
				}
			}) .

	- block helpers
		- super
		- block message
			< template v-if = messageHelpers
				- forEach ['error', 'info'] => el
					< _.&__message-box[.&_pos_right-top].&__${el}-box
						< _.&__message-content
							{{ ${el} }}
