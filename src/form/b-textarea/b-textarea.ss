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
	- rootWrapper = true
	- nativeInputTag = 'textarea'

	- block body
		- super

		- block wrapper
			+= self.nativeInput()

	- block helpers
		- super

		- block limit
			< template v-if = vdom.getSlot('limit')
				< _.&__limit
					+= self.slot('limit', {':limit': 'limit', ':maxLength': 'maxLength'})

			< template v-else
				< _.&__limit[.&_hidden_true] v-update-on = { &
					emitter: 'limit',
					handler: onLimitUpdate,
					options: {immediate: true}
				} .
