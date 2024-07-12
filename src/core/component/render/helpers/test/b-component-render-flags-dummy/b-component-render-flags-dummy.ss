- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'components/super/i-block'|b as placeholder

- template index() extends ['i-block'].index
	- block body
		< template v-if = stage === 'default'
			/// Extra div is required to guarantee that the button becomes a regular vnode and not a block
			< .
				< button @click = () => onClick() | -testid = vnode
					+= self.slot()

		< template v-if = stage === 'v-attrs'
			< .
				/// Due to a dynamic value in v-attrs, the generated vnode will always have the "props" patchFlag.
				/// However, we still test it just in case.
				< button v-attrs = {onClick: onClick.bind(self)} | -testid = vnode
					+= self.slot()
