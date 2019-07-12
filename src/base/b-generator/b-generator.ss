- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'super/i-block'|b as placeholder

- template index() extends ['i-block'].index
	- block body
		< template v-for = el in content
			< component :is = el.component | :v-attrs = el.attrs | :v-slots = el.slots
				- block slots
					< template #@ = {slotContent}
						- block defaultSlot
							< template v-if = Object.isArray(slotContent) || Object.isObject(slotContent)
								< @b-generator :content = [].concat(slotContent)

							< template v-else
								{{ slotContent }}
