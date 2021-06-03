- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'super/i-input-text'|b as placeholder

- template index() extends ['i-input-text'].index
	- rootTag = 'span'
	- rootWrapper = true
	- nativeInputTag = 'textarea'

	- block body
		- super

		- block wrapper
			< _.&__wrapper ref = wrapper
				+= self.nativeInput({attrs: {'@input': 'onEdit'}})

	- block helpers
		- super

		- block limit
			+= self.slot('limit', {':limit': 'limit', ':maxlength': 'maxLength'})
				< _.&__limit[.&_hidden_true] v-update-on = { &
					emitter: 'limit',
					handler: onLimitUpdate,
					options: {immediate: true}
				} .
