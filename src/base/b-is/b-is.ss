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
	- overWrapper = false

	- block body
		- block component(keepAlive, include, exclude)
			: keepAliveAttrs = {}

			- if include
				? keepAliveAttrs.include = 'include'

			- if exclude
				? keepAliveAttrs.exclude = 'exclude'

			< ${keepAlive ? 'keep-alive' : '?'} ${keepAliveAttrs}
				< component &
					v-if = component |
					:is = component
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
