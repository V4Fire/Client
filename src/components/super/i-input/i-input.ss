- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'components/super/i-data'|b as placeholder

- template index() extends ['i-data'].index
	- skeletonMarker = true

	- nativeInputTag = 'input'
	- nativeInputType = "'hidden'"
	- nativeInputModel = 'valueModel'

	- block headHelpers
		- super

		/**
		 * Generates a native form input
		 *
		 * @param [params] - additional parameters:
		 *   *) [tag=nativeInputTag] - the name of the generated tag
		 *   *) [elName='input'] - the element name of the generated tag
		 *
		 *   *) [ref='input'] - the `ref` attribute
		 *   *) [model=nativeInputModel] - the `v-model` attribute
		 *
		 *   *) [id='id'] - the `:id` attribute
		 *   *) [name='name'] - the `:name` attribute
		 *   *) [form='form'] - the `:form` attribute
		 *   *) [type=nativeInputType] - the `:type` attribute
		 *
		 *   *) [autofocus] - the `:autofocus` attribute
		 *   *) [tabIndex] - the `:autofocus` attribute
		 *
		 *   *) [focusHandler] - the `@focus` attribute
		 *   *) [blurHandler] - the `@blur` attribute
		 *
		 *   *) [attrs] - a dictionary with additional attributes
		 *
		 * @param {string} [content] - the slot content
		 */
		- block nativeInput(@params = {}, content = '')
			{{ void(tmp.attrs = normalizeAttrs(attrs)) }}

			< ${@tag || nativeInputTag}.&__${@elName || 'input'} &
				ref = ${@ref || 'input'} |
				v-model = ${@model || nativeInputModel || FALSE} |

				:id = ${@id || 'id'} |
				:name = ${@name || 'name'} |
				:form = ${@form || 'form'} |
				:type = ${@type} || tmp.attrs.type || ${nativeInputType} |

				:autofocus = ${@autofocus || 'autofocus'} |
				:tabindex = ${@tabIndex || 'tabIndex'} |

				@focus = ${@focusHandler || 'onFocus'} |
				@blur = ${@blurHandler || 'onBlur'} |

				v-attrs = tmp.attrs |
				${Object.assign({}, attrs, @attrs)|!html}
			.
				+= content

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

	- block bodyFooter
		- super

		- block message
			< template v-if = messageHelpers
				- forEach ['error', 'info'] => el
					< _.&__message-box[.&_pos_right-top].&__${el}-box
						< _.&__message-content
							{{ ${el} }}
