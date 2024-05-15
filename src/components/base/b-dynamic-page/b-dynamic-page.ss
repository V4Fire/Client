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

	- block body
		: graph = include('build/graph/component-params')

		? Object.assign(attrs, graph.getComponentPropAttrs(self.name(PARENT_TPL_NAME)))
		? delete attrs[':is']
		? delete attrs[':keepAlive']
		? delete attrs[':dispatching']

		< template v-for = el in asyncRender.iterate(renderIterator, {filter: renderFilter, group: registerRenderGroup})
			< component.&__component &
				v-if = !pageTakenFromCache |
				ref = component |

				:is = page |
				:dispatching = true |
				:canFunctional = false |

				v-attrs = {'@hook:destroyed': createPageDestructor()} |
				${attrs}
			.
