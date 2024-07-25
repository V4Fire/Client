- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- import $C from 'collection.js'
- include 'super/i-dynamic-page'|b as placeholder

- template index() extends ['i-dynamic-page'].index
	- block body
		: graph = include('build/graph/component-params')

		? Object.assign(attrs, graph.getComponentPropAttrs(self.name(PARENT_TPL_NAME)))
		? delete attrs[':is']
		? delete attrs[':keepAlive']
		? delete attrs[':dispatching']

		< template v-for = el in asyncRender.iterate(renderIterator, {filter: renderFilter})
			< component.&__component &
				v-if = !pageTakenFromCache |
				ref = component |
				:instanceOf = iDynamicPage |
				:is = field.get('page.0') |
				:key = field.get('page.1') |
				:dispatching = true |
				${attrs}
			.
