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
		- super

		< ul.&__wrapper v-aria:listbox = {...getAriaConfig('listbox'), label: 'test'}

			< template v-for = (el, i) in items | :key = getItemKey(el, i)
				< li.&__item &
					:id = el.id |
					:value = el.value |

					v-aria:option = getAriaConfig('option', el) |
					@click = onItemClick |
					@keydown = onItemKeydown
				.
						< span.&__cell.&__link-value
							{{ el.label }}
