- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'components/super/i-dynamic-page'|b as placeholder

- template index() extends ['i-dynamic-page'].index
	- block rootAttrs
		- super
		? rootAttrs['v-async-target'] = TRUE
		? rootAttrs['v-memo'] = '[]'

	- block body
		< template v-for = el in asyncRender.iterate(renderIterator, {filter: renderFilter, group: registerRenderGroup})
			< component.&__component &
				v-if = !pageTakenFromCache && page != null |
				ref = component |

				:is = page |
				:instanceOf = iDynamicPage |
				:canFunctional = false |

				v-attrs = getPageProps()
			.
