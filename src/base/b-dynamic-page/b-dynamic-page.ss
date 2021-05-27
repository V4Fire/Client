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
		: tree = include('build/snakeskin')

		? Object.assign(attrs, tree.getComponentPropAttrs(self.name(PARENT_TPL_NAME)))
		? delete attrs[':is']
		? delete attrs[':keepAlive']
		? delete attrs[':dispatching']

		< template v-for = el in asyncRender.iterate(renderIterator, {filter: renderFilter})
			< component.&__component &
				v-if = !getKeepAliveStrategy(page).has() |
				ref = component |
				:instanceOf = iDynamicPage |
				:is = page |
				:dispatching = true |
				${attrs}
			.
