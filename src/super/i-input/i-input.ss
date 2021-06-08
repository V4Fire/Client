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
		 *
		 *   *) [ref='input'] - value of the `ref` attribute
		 *   *) [model=nativeInputModel] - value of the `v-model` attribute
		 *
		 *   *) [id='id'] - value of the `:id` attribute
		 *   *) [name='name'] - value of the `:name` attribute
		 *   *) [form='form'] - value of the `:form` attribute
		 *   *) [type=nativeInputType] - value of the `:type` attribute
		 *
		 *   *) [autofocus] - value of the `:autofocus` attribute
		 *   *) [tabIndex] - value of the `:autofocus` attribute
		 *
		 *   *) [focusHandler] - value of the `@focus` attribute
		 *   *) [blurHandler] - value of the `@blur` attribute
		 *
		 *   *) [attrs] - dictionary with additional attributes
		 */
		- block nativeInput(@params = {})
			{{ void(tmp.attrs = normalizeAttrs(attrs)) }}

			< ${@tag || nativeInputTag}.&__${@elName || 'input'} &
				ref = ${@ref || 'input'} |
				v-model = ${@model || nativeInputModel} |

				:id = ${@id || 'id'} |
				:name = ${@name || 'name'} |
				:form = ${@form || 'form'} |
				:type = ${@type} || tmp.attrs.type || ${nativeInputType} |

				:autofocus = ${@autofocus || 'autofocus'} |
				:tabIndex = ${@tabIndex || 'tabIndex'} |

				@focus = ${@focusHandler || 'onFocus'} |
				@blur = ${@blurHandler || 'onBlur'} |

				:v-attrs = tmp.attrs |
				${Object.assign({}, attrs, @attrs)|!html}
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
