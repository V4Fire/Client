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
			< button @click = () => onClick() | -testid = vnode
				+= self.slot()

		< template v-if = stage === 'v-attrs'
			< button v-attrs = {onClick: onClick.bind(self)} | -testid = vnode
				+= self.slot()
