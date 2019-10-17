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
	- rootWrapper = true
	- skeletonMarker = false

	- block body
		- super

		- block input
			+= self.hiddenInput()

		- block list
			< .&__list
				< b-matryoshkas &
					:options = options |
					:option = option |
					:childAttrsFn = getOptionProps
				.
					< template slot-scope = o | v-if = vdom.getSlot('default')
						+= self.slot('default', {':option': 'o.option'})
