- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'components/super/i-input-text'|b as placeholder

- template index() extends ['i-input-text'].index
	- rootTag = 'span'
	- rootWrapper = true
	- nativeInputTag = 'textarea'

	- block body
		- super

		- block wrapper
			+= self.nativeInput({attrs: {'@input': 'onEdit'}})

	- block bodyFooter
		- super

		- block limit
			< template v-if = $slots['limit']
				< _.&__limit
					+= self.slot('limit', {':limit': 'limit', ':maxLength': 'maxLength'})

			< template v-else
				< _.&__limit[.&_hidden_true] v-bind-with = { &
					path: 'limit',
					then: onLimitUpdate,
					options: {immediate: true}
				} .
