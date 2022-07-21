- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'super/i-input'|b as placeholder

- template index() extends ['i-input'].index
	- nativeInputType = "'checkbox'"
	- nativeInputModel = undefined

	- block hiddenInput()
		+= self.nativeInput({ &
			elName: 'hidden-input',
			id: 'id || dom.getId("input")',

			attrs: {
				autocomplete: 'off'
			}
		}) .

	- block rootAttrs
		- super
		? rootAttrs[':-parent-id'] = 'parentId'

	- block attrs
		- super
		? attrs['@click'] = 'onClick'

	- block body
		- super

		- block input
			+= self.hiddenInput()

		- block wrapper
			< _.&__wrapper @click = onClick
				- block checkbox
					< _.&__checkbox
						- block check
							+= self.slot('check')
								< _.&__check

					- block label
						< label.&__label &
							v-if = label || vdom.getSlot('label') |
							:for = id || dom.getId('input') .
							+= self.slot('label', {':label': 'label'})
								{{ t(label) }}
