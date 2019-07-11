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
			< component :is = el.component | :v-attrs = el.attrs
				< template #@ = {slotContent}
					< template v-if = Object.isArray(slotContent) || Object.isObject(slotContent)
						< @b-generate :content = [].concat(slotContent)

					< template v-else
						{{ slotContent }}
