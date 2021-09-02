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
	- nativeInputValue = 'valueStore'

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
		 *   *) [value=nativeInputValue] - value of the `:value` attribute
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
		 *
		 * @param {string=} [content] - slot content
		 */
		- block nativeInput(@params = {}, content = '')
			{{ void(tmp.attrs = normalizeAttrs(attrs)) }}

			< ${@tag || nativeInputTag}.&__${@elName || 'input'} &
				ref = ${@ref || 'input'} |

				:value = ${@value || nativeInputValue} |
				:id = ${@id || 'id'} |
				:name = ${@name || 'name'} |
				:form = ${@form || 'form'} |
				:type = ${@type} || tmp.attrs.type || ${nativeInputType} |

				:autofocus = ${@autofocus || 'autofocus'} |
				:tabindex = ${@tabIndex || 'tabIndex'} |

				@focus = ${@focusHandler || 'onFocus'} |
				@blur = ${@blurHandler || 'onBlur'} |
				@input = (e) => field.set('value', e.target.value) |

				:v-attrs = tmp.attrs |
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

	- block helpers
		- super
		- block message
			< template v-if = messageHelpers
				- forEach ['error', 'info'] => el
					< _.&__message-box[.&_pos_right-top].&__${el}-box
						< _.&__message-content
							{{ ${el} }}
