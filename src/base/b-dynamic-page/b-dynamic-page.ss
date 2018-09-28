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
	- overWrapper = false

	- block body
		: tree = include('build/snakeskin.webpack')

		? Object.assign(attrs, tree.getComponentPropAttrs(self.name(PARENT_TPL_NAME)))
		? attrs[':dispatching'] = true
		? attrs[':selfDispatching'] = true
		? delete attrs[':is']

		- block component(keepAlive, include, exclude)
			: keepAliveAttrs = Object.assign({}, attrs)

			- if include
				? keepAliveAttrs.include = 'include'

			- if exclude
				? keepAliveAttrs.exclude = 'exclude'

			< ${keepAlive ? 'keep-alive' : '?'} ${keepAliveAttrs}
				< component &
					ref = component |
					v-if = page |
					:is = page |
					${attrs}
				.

		< template v-if = keepAlive
			< template v-if = include && exclude
				+= self.component(true, true, true)

			< template v-else-if = include
				+= self.component(true, true)

			< template v-else-if = exclude
				+= self.component(true, false, true)

			< template v-else
				+= self.component(true)

		< template v-else
			+= self.component()
